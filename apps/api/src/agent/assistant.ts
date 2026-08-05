// Assistente do app: recebe a conversa vinda do botão flutuante e executa
// usando as tools do MCP — o mesmo servidor exposto ao Cursor, aqui conectado
// em memória, amarrado ao tenant/usuário da sessão. OpenAI orquestra
// (function calling em loop) e devolve a resposta + ações executadas.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type OpenAI from "openai";
import type { AgentAction, AgentMessage, AgentResult } from "@app/shared";
import { env } from "../lib/env";
import { createMcpServer, type AgentContext } from "./mcp-server";
import { getOpenAI } from "./openai";

const MAX_ROUNDS = 8;

/** Tools de escrita aparecem como ações na UI; leituras não. */
const WRITE_TOOLS = new Set(["create_note", "update_note", "delete_note"]);

function systemPrompt(ctx: AgentContext): string {
  return `Você é o assistente do App Base dentro do tenant "${ctx.tenantName}". Está falando com ${ctx.userName} (role: ${ctx.role}).

Você lê e gerencia o conteúdo do tenant pelas tools disponíveis (informações do tenant, membros e notas).

Como agir:
- Interprete a intenção e execute — não peça confirmação para ações simples e reversíveis (criar ou editar nota).
- Descubra ids reais antes de escrever: use list_notes. Nunca invente ids.
- Ao editar uma nota, leia antes com get_note e reenvie o conteúdo completo já alterado.
- Só apague algo (delete_note) se o pedido for explícito.
- Se o pedido for ambíguo demais para agir com segurança, diga o que falta em uma frase.

Resposta final: curta e direta, em pt-BR, sem repetir ids técnicos.`;
}

function describeAction(tool: string, args: Record<string, unknown>): string {
  switch (tool) {
    case "create_note":
      return `Nota criada: ${String(args.title ?? "")}`;
    case "update_note":
      return `Nota atualizada: ${String(args.title ?? "")}`;
    case "delete_note":
      return "Nota apagada";
    default:
      return tool;
  }
}

export async function runAssistant(
  ctx: AgentContext,
  messages: AgentMessage[],
): Promise<AgentResult> {
  const openai = getOpenAI();

  // Par cliente/servidor em memória por request, amarrado ao contexto
  const server = createMcpServer(ctx);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const mcp = new Client({ name: "app-base-assistant", version: "1.0.0" });
  await mcp.connect(clientTransport);

  try {
    const { tools } = await mcp.listTools();
    const openaiTools: OpenAI.Chat.Completions.ChatCompletionTool[] = tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema as Record<string, unknown>,
      },
    }));

    const chat: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt(ctx) },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];
    const actions: AgentAction[] = [];

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const response = await openai.chat.completions.create({
        model: env.assistantModel,
        messages: chat,
        tools: openaiTools,
      });
      const message = response.choices[0]?.message;
      if (!message) break;
      chat.push(message);

      const toolCalls = message.tool_calls ?? [];
      if (toolCalls.length === 0) {
        return { reply: message.content?.trim() || "Feito.", actions };
      }

      for (const call of toolCalls) {
        if (call.type !== "function") continue;
        const name = call.function.name;
        const args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;

        let text = "";
        let isError = false;
        try {
          const result = await mcp.callTool({ name, arguments: args });
          isError = Boolean(result.isError);
          text = (result.content as { type: string; text?: string }[])
            .map((part) => part.text ?? "")
            .join("\n");
        } catch (err) {
          isError = true;
          text = err instanceof Error ? err.message : String(err);
        }

        if (isError || WRITE_TOOLS.has(name)) {
          actions.push({
            tool: name,
            summary: isError ? text : describeAction(name, args),
            isError,
          });
        }
        chat.push({ role: "tool", tool_call_id: call.id, content: text || "(vazio)" });
      }
    }

    return { reply: "Não consegui concluir dentro do limite de passos.", actions };
  } finally {
    await mcp.close();
    await server.close();
  }
}
