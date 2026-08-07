/** Shared field/button primitives so every auth screen looks like the real one. */
export function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium">{label}</p>
      <div
        className={`flex h-9 items-center rounded-md border px-3 text-sm text-muted-foreground ${
          mono ? "tracking-widest" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export function SubmitButton({ label }: { label: string }) {
  return (
    <div className="flex h-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
      {label}
    </div>
  );
}
