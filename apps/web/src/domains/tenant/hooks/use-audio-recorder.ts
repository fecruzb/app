import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderError = "unsupported" | "permission";

type Options = {
  /** Receives the recording after a successful stop. */
  onAudio: (audio: Blob) => void;
  onError?: (kind: RecorderError) => void;
};

// Safari only records WebM/Opus from 18.4 on; audio/mp4 closes the list as the
// fallback for older iPhones and iPads.
const PREFERRED_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

/**
 * Raw microphone capture (getUserMedia + MediaRecorder) that hands the final
 * blob to the caller. What happens to the audio is the caller's business.
 */
export function useAudioRecorder({ onAudio, onError }: Options) {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);
  const callbacksRef = useRef({ onAudio, onError });
  useEffect(() => {
    callbacksRef.current = { onAudio, onError };
  });

  const releaseMic = useCallback(() => {
    if (!streamRef.current) return;
    for (const track of streamRef.current.getTracks()) track.stop();
    streamRef.current = null;
  }, []);

  // Release the microphone if the component unmounts mid-recording.
  useEffect(() => releaseMic, [releaseMic]);

  const start = useCallback(async () => {
    if (recorderRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      callbacksRef.current.onError?.("unsupported");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      cancelledRef.current = false;

      const type = PREFERRED_TYPES.find((item) => MediaRecorder.isTypeSupported(item));
      const recorder = type
        ? new MediaRecorder(stream, { mimeType: type })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const audio = new Blob(chunksRef.current, {
          type: recorder.mimeType || type || "audio/webm",
        });
        recorderRef.current = null;
        chunksRef.current = [];
        releaseMic();
        setRecording(false);
        if (!cancelledRef.current) callbacksRef.current.onAudio(audio);
      };

      recorder.start(250);
      setRecording(true);
    } catch {
      releaseMic();
      setRecording(false);
      callbacksRef.current.onError?.("permission");
    }
  }, [releaseMic]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      recorderRef.current = null;
      releaseMic();
      setRecording(false);
      return;
    }
    recorder.stop();
  }, [releaseMic]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    stop();
  }, [stop]);

  return { recording, start, stop, cancel };
}
