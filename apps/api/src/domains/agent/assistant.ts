// Assistente do app: recebe a conversa do botão flutuante e responde usando as
// tools do registry (as mesmas expostas ao Cursor via MCP). Aqui é a "policy"
// do produto — quem é o agente e como age; a mecânica do loop de tool-calling
// vive em integrations/openai.
import { z } from "zod";
import type { AgentMessage, AgentResult } from "@app/shared";
import { runToolLoop, type LoopTool } from "@/integrations/openai";
import { env } from "@/lib/env";
import { allTools, getTool } from "./registry";
import type { AgentContext } from "./tool";

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

export async function runAssistant(
  ctx: AgentContext,
  messages: AgentMessage[],
): Promise<AgentResult> {
  const tools: LoopTool[] = allTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    run: async (rawArgs) => {
      const args = z.object(tool.inputSchema).parse(rawArgs);
      const result = await tool.execute(ctx, args);
      const text = result.content.map((p) => ("text" in p ? p.text : "")).join("\n");
      return { text, isError: Boolean(result.isError) };
    },
  }));

  const { reply, calls } = await runToolLoop({
    model: env.assistantModel,
    system: systemPrompt(ctx),
    messages,
    tools,
  });

  // Tools de escrita (que declaram `summarize`) e erros viram chips na UI.
  const actions = calls.flatMap(({ name, args, text, isError }) => {
    const summarize = getTool(name)?.summarize;
    if (!isError && !summarize) return [];
    return [{ tool: name, summary: isError ? text : (summarize?.(args) ?? name), isError }];
  });

  return { reply, actions };
}
