import type { ComponentType } from "react";
import {
  BoxIcon,
  CheckIcon,
  CheckSquareIcon,
  ChevronsUpDownIcon,
  HomeIcon,
  KeyRoundIcon,
  MailIcon,
  PlusIcon,
  SendIcon,
  SettingsIcon,
  SparklesIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";

/** Static, faithful mockups of the product UI — no data or app imports. */

/** Just the browser chrome bar (dots + label), so it can stay fixed while the body swaps. */
export function WindowBar({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
      <span className="size-2.5 rounded-full bg-muted-foreground/25" />
      <span className="size-2.5 rounded-full bg-muted-foreground/25" />
      <span className="size-2.5 rounded-full bg-muted-foreground/25" />
      <span className="ml-2 truncate font-mono text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/** Chrome frame so a mock reads as a real screen without pretending to be one. */
function Window({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <WindowBar label={label} />
      {children}
    </div>
  );
}

export function AgentChatMock() {
  return (
    <Window label="assistant">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <SparklesIcon className="size-4" />
        <span className="flex-1 text-sm font-semibold">Assistant</span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
            Add a task to prepare tomorrow's standup
          </div>
        </div>
        <div className="flex">
          <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
            Done — I added “Prepare tomorrow's standup” to your task list.
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                Task created: Prepare tomorrow's standup
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-end gap-2 border-t p-3">
        <div className="flex h-9 flex-1 items-center rounded-md border px-3 text-sm text-muted-foreground">
          Talk to the assistant…
        </div>
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <SendIcon className="size-4" />
        </div>
      </div>
    </Window>
  );
}

/** Shared field/button primitives so every auth screen looks like the real one. */
function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
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

function SubmitButton({ label }: { label: string }) {
  return (
    <div className="flex h-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
      {label}
    </div>
  );
}

/** The inner content of an auth screen (no chrome), so it can crossfade in place. */
function AuthBody({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: string;
}) {
  return (
    <div className="flex flex-col items-center gap-5 bg-muted/40 p-4 sm:p-8">
      <div className="flex items-center gap-2 font-semibold">
        <BoxIcon className="size-5" />
        App Base
      </div>
      <div className="w-full max-w-xs rounded-xl border bg-card p-5 text-left shadow-sm sm:p-6">
        <p className="text-lg font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <div className="mt-5 space-y-3">{children}</div>
      </div>
      <p className="text-xs text-muted-foreground">{footer}</p>
    </div>
  );
}

/** A single centered auth screen, filling a full section like the other mocks. */
function AuthScreen({
  route,
  ...body
}: {
  route: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: string;
}) {
  return (
    <Window label={route}>
      <AuthBody {...body} />
    </Window>
  );
}

export function LoginMock() {
  return (
    <AuthScreen
      route="/login"
      title="Welcome back"
      description="Sign in to continue."
      footer="New here? Create account"
    >
      <Field label="Email" value="you@example.com" />
      <Field label="Password" value="••••••••" mono />
      <SubmitButton label="Sign in" />
    </AuthScreen>
  );
}

function RegisterBody() {
  return (
    <AuthBody
      title="Create your account"
      description="Start in seconds."
      footer="Have an account? Sign in"
    >
      <Field label="Name" value="Ada Lovelace" />
      <Field label="Email" value="you@example.com" />
      <Field label="Password" value="••••••••" mono />
      <SubmitButton label="Create account" />
    </AuthBody>
  );
}

export function RegisterMock() {
  return (
    <Window label="/register">
      <RegisterBody />
    </Window>
  );
}

function ForgotPasswordBody() {
  return (
    <AuthBody
      title="Forgot password"
      description="We'll email you a reset link."
      footer="Remembered it? Sign in"
    >
      <Field label="Email" value="you@example.com" />
      <SubmitButton label="Send reset link" />
    </AuthBody>
  );
}

export function ForgotPasswordMock() {
  return (
    <Window label="/forgot-password">
      <ForgotPasswordBody />
    </Window>
  );
}

function ResetPasswordBody() {
  return (
    <AuthBody
      title="Choose a new password"
      description="Set a new password for your account."
      footer="Link expires in 1 hour"
    >
      <Field label="New password" value="••••••••" mono />
      <Field label="Confirm password" value="••••••••" mono />
      <SubmitButton label="Reset password" />
    </AuthBody>
  );
}

export function ResetPasswordMock() {
  return (
    <Window label="/reset-password">
      <ResetPasswordBody />
    </Window>
  );
}

/** An email in an inbox frame: header row + the rendered template body with a CTA. */
function EmailBody({
  subject,
  heading,
  body,
  cta,
}: {
  subject: string;
  heading: string;
  body: React.ReactNode;
  cta: string;
}) {
  return (
    <>
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{subject}</p>
          <p className="truncate text-xs text-muted-foreground">
            App Base &lt;no-reply@appbase.dev&gt; → you@example.com
          </p>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          now
        </span>
      </div>
      <div className="bg-muted/40 p-4 sm:p-6">
        <div className="mx-auto max-w-sm rounded-xl border bg-card p-5 text-center shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-center gap-2 font-semibold">
            <BoxIcon className="size-5" />
            App Base
          </div>
          <p className="text-base font-semibold">{heading}</p>
          <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          <div className="mt-5 flex h-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
            {cta}
          </div>
        </div>
      </div>
    </>
  );
}

function VerifyEmailBody() {
  return (
    <EmailBody
      subject="Confirm your email"
      heading="Confirm your email"
      body="Hi Ada! Confirm your email address to finish signing up. This link expires in 24 hours."
      cta="Confirm email"
    />
  );
}

function ResetEmailBody() {
  return (
    <EmailBody
      subject="Reset your password"
      heading="Reset your password"
      body="We got a request to reset your password. This link is single-use and expires in 1 hour. If it wasn't you, ignore this email."
      cta="Reset password"
    />
  );
}

export function VerifyEmailMock() {
  return (
    <Window label="inbox">
      <VerifyEmailBody />
    </Window>
  );
}

function InviteMembersBody() {
  const members = [
    { name: "Ada Lovelace", email: "ada@acme.com", role: "owner", self: true },
    { name: "Alan Turing", email: "alan@acme.com", role: "admin", self: false },
  ];
  return (
    <div className="space-y-4 p-5">
      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Invites</p>
          <p className="text-xs text-muted-foreground">Invite people to this tenant by email</p>
        </div>
        <div className="flex items-end gap-2 p-4">
          <div className="flex-1">
            <p className="mb-1 text-xs font-medium">Email</p>
            <div className="flex h-9 items-center rounded-md border px-3 text-sm text-muted-foreground">
              sam@acme.com
            </div>
          </div>
          <div className="flex h-9 items-center gap-1 rounded-md border px-3 text-sm text-muted-foreground">
            member
            <ChevronsUpDownIcon className="size-3.5" />
          </div>
          <div className="flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Invite
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Members</p>
          <p className="text-xs text-muted-foreground">Who has access to this tenant</p>
        </div>
        <div className="divide-y">
          {members.map((m) => (
            <div key={m.email} className="flex items-center gap-3 px-4 py-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {m.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {m.name}
                  {m.self && <span className="text-muted-foreground"> (you)</span>}
                </p>
                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
              </div>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InviteMembersMock() {
  return (
    <Window label="/app/acme/settings">
      <InviteMembersBody />
    </Window>
  );
}

function InviteEmailBody() {
  return (
    <EmailBody
      subject="Invitation to Acme Inc"
      heading="Invitation to Acme Inc"
      body={
        <>
          Ada Lovelace invited you to join{" "}
          <span className="font-medium text-foreground">Acme Inc</span>. This invite expires in 7
          days.
        </>
      }
      cta="Accept invite"
    />
  );
}

export function InviteEmailMock() {
  return (
    <Window label="inbox">
      <InviteEmailBody />
    </Window>
  );
}

export function McpKeysMock() {
  return (
    <Window label="/app/acme/account">
      <div className="space-y-4 p-5">
        <div className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <KeyRoundIcon className="size-3.5" /> API keys (MCP)
            </p>
            <p className="text-xs text-muted-foreground">Reach the tenant over MCP from Cursor</p>
          </div>
          <div className="flex items-end gap-2 p-4">
            <div className="flex-1">
              <p className="mb-1 text-xs font-medium">Name</p>
              <div className="flex h-9 items-center rounded-md border px-3 text-sm text-muted-foreground">
                Cursor
              </div>
            </div>
            <div className="flex h-9 items-center gap-1 rounded-md border px-3 text-sm text-muted-foreground">
              Acme Inc
              <ChevronsUpDownIcon className="size-3.5" />
            </div>
            <div className="flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
              Create key
            </div>
          </div>
          <div className="mx-4 mb-4 rounded-md border bg-muted/40 p-3">
            <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
              {`{
  "mcpServers": {
    "app-base": {
      "url": "https://acme.app/api/mcp",
      "headers": { "Authorization": "Bearer abk_a1b2c3…" }
    }
  }
}`}
            </p>
          </div>
        </div>
      </div>
    </Window>
  );
}

export function ShellMock() {
  const nav = [
    { icon: HomeIcon, label: "Home", active: true },
    { icon: CheckSquareIcon, label: "Tasks", active: false },
    { icon: SettingsIcon, label: "Settings", active: false },
  ];
  return (
    <Window label="/app/acme">
      <div className="relative flex min-h-72 text-sm">
        <aside className="flex w-44 flex-col gap-3 border-r p-3">
          <div className="flex items-center gap-2 px-2 font-semibold">
            <BoxIcon className="size-4" />
            App Base
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-1.5 text-xs">
            <span className="truncate">Acme Inc</span>
            <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {nav.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${
                  item.active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-2 rounded-md p-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
              AD
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">Ada Lovelace</p>
              <p className="truncate text-[10px] text-muted-foreground">ada@acme.com</p>
            </div>
          </div>
        </aside>
        <div className="flex-1 p-5">
          <p className="text-base font-semibold">Hi, Ada</p>
          <p className="text-xs text-muted-foreground">
            You're in <span className="font-medium text-foreground">Acme Inc</span>
            <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px]">owner</span>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold">3 members</p>
              <p className="mt-1 text-[11px] text-muted-foreground">People with access</p>
              <p className="mt-3 flex items-center gap-1 text-[11px]">
                Manage members <CheckIcon className="size-3" />
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold">5 tasks</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Example resource</p>
              <p className="mt-3 flex items-center gap-1 text-[11px]">
                View tasks <CheckIcon className="size-3" />
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <SparklesIcon className="size-5" />
        </div>
      </div>
    </Window>
  );
}

export function TasksMock() {
  const tasks = [
    { title: "Design the schema", done: true },
    { title: "Wire the repository", done: true },
    { title: "Expose the endpoint", done: false },
    { title: "Build the screen", done: false },
  ];
  return (
    <Window label="/app/acme/tasks">
      <div className="space-y-4 p-5 text-sm">
        <div>
          <p className="text-base font-semibold">Tasks</p>
          <p className="text-xs text-muted-foreground">
            Example resource with per-tenant CRUD · 2 of 4 left
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex h-9 flex-1 items-center rounded-md border px-3 text-xs text-muted-foreground">
            Add a task...
          </div>
          <div className="flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
            <PlusIcon className="size-3.5" /> Add
          </div>
        </div>
        <div className="divide-y rounded-lg border">
          {tasks.map((task) => (
            <div key={task.title} className="flex items-center gap-3 px-3 py-2.5">
              <span
                className={`flex size-4 shrink-0 items-center justify-center rounded-md border ${
                  task.done ? "border-primary bg-primary text-primary-foreground" : "border-input"
                }`}
              >
                {task.done && <CheckIcon className="size-3" />}
              </span>
              <span
                className={`flex-1 text-xs ${
                  task.done ? "text-muted-foreground line-through" : ""
                }`}
              >
                {task.title}
              </span>
              <Trash2Icon className="size-3.5 text-muted-foreground/60" />
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

export function AccountMock() {
  return (
    <Window label="/app/acme/account">
      <div className="space-y-4 p-5 text-sm">
        <div>
          <p className="text-base font-semibold">My account</p>
          <p className="text-xs text-muted-foreground">Manage your profile and security.</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
            <UserIcon className="size-3.5" /> Profile
          </div>
          <Field label="Name" value="Ada Lovelace" />
          <div className="h-2" />
          <Field label="Email" value="ada@acme.com" />
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold">
            <KeyRoundIcon className="size-3.5" /> Password
          </div>
          <Field label="New password" value="••••••••" mono />
        </div>
      </div>
    </Window>
  );
}

/** One screen inside the browser chrome: a route label and its bodyless content. */
export type Screen = { label: string; Body: ComponentType };

/**
 * Multi-screen flows for the carousel. Each entry keeps the browser chrome fixed
 * and only swaps the body inside, so alternating never resizes the frame.
 */
export const flows = {
  register: [
    { label: "/register", Body: RegisterBody },
    { label: "inbox", Body: VerifyEmailBody },
  ],
  recovery: [
    { label: "/forgot-password", Body: ForgotPasswordBody },
    { label: "inbox", Body: ResetEmailBody },
    { label: "/reset-password", Body: ResetPasswordBody },
  ],
  invite: [
    { label: "/app/acme/settings", Body: InviteMembersBody },
    { label: "inbox", Body: InviteEmailBody },
  ],
} satisfies Record<string, Screen[]>;
