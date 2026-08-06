import type { AppContext } from "@/context";
import { hasOpenAiKey, transcribeAudio } from "@/integrations/openai";
import { usageRepository } from "@/domains/usage/repository";
import { assertAiBudget } from "@/domains/billing/service";
import { env } from "@/lib/env";
import { HttpError } from "@/lib/errors";

/** Max audio upload size (~20 minutes of Opus; under OpenAI's 25 MB ceiling). */
const MAX_AUDIO_BYTES = 10_000_000;

/**
 * Transcribe audio
 *
 * `POST /api/tenants/:tenantId/agent/transcribe`
 *
 * Voice input for the assistant: accepts multipart audio, checks the user's AI
 * budget, transcribes via OpenAI, records usage, and returns the text.
 * Content-Length is checked before buffering an oversized body.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with `{ text }`
 */
export async function transcribe(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  if (!hasOpenAiKey()) {
    throw new HttpError(503, "Agent unavailable — set OPENAI_API_KEY");
  }
  const user = c.get("user");
  const tenant = c.get("tenant");

  // -- Processing ------------------------------------------------------------
  await assertAiBudget(user.id, tenant.id);

  if (Number(c.req.header("content-length") ?? 0) > MAX_AUDIO_BYTES) {
    throw new HttpError(413, "Recording too long");
  }
  const form = await c.req.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File) || audio.size === 0) {
    throw new HttpError(400, "Send the recording in the audio field");
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    throw new HttpError(413, "Recording too long");
  }

  const { text, usage } = await transcribeAudio({ model: env.transcribeModel, file: audio });
  await usageRepository.insert({ userId: user.id, tenantId: tenant.id, ...usage });

  // -- Output ----------------------------------------------------------------
  return c.json({ text });
}
