import type { AgentMessage, AgentResult, AgentTranscriptDto } from "@app/shared";
import { api } from "@/lib/api";

/**
 * OpenAI picks the decoder from the file extension, so it has to match the
 * container the browser actually recorded — Safari's audio/mp4 sent as .webm
 * comes back as a corrupted file.
 */
function audioExtension(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4") || mimeType.includes("aac")) return "mp4";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

/** In-app assistant chat and voice transcription (tenant-scoped agent routes). */
export const agentApi = {
  chat: (tenantId: string, messages: AgentMessage[]) =>
    api.post<AgentResult>(`/tenants/${tenantId}/agent`, { messages }),

  transcribe: (tenantId: string, audio: Blob) => {
    const form = new FormData();
    form.append("audio", audio, `recording.${audioExtension(audio.type)}`);
    return api.upload<AgentTranscriptDto>(`/tenants/${tenantId}/agent/transcribe`, form);
  },
};
