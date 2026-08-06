import type { AppContext } from "@/context";
import { hasOpenAiKey, transcribeAudio } from "@/integrations/openai";
import { usageRepository } from "@/domains/usage/repository";
import { assertAiBudget } from "@/domains/usage/service";
import { env } from "@/lib/env";
import { HttpError } from "@/lib/errors";

// Roughly 20 minutes of Opus — well under OpenAI's own 25 MB ceiling.
const MAX_AUDIO_BYTES = 10_000_000;

/** Voice input for the assistant: audio in, text out. The caller sends it as a message. */
export async function transcribe(c: AppContext) {
  if (!hasOpenAiKey()) {
    throw new HttpError(503, "Agent unavailable — set OPENAI_API_KEY");
  }
  const user = c.get("user");
  const tenant = c.get("tenant");

  await assertAiBudget(user.id);

  // Checked before reading the body so an oversized upload isn't buffered.
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

  return c.json({ text });
}
