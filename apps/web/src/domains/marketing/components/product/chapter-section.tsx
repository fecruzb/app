import { type ComponentType, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Window } from "@app/ui/browser-window";
import { FeatureSplit } from "../feature-split";
import {
  AccountMock,
  AdminInvitesBody,
  AdminPeopleBody,
  AdminPlansBody,
  AdminTenantsPlanBody,
  AgentChatMock,
  ForgotPasswordBody,
  InviteEmailBody,
  InviteMembersBody,
  LoginMock,
  McpKeysMock,
  PlatformInviteEmailBody,
  RegisterBody,
  ResetEmailBody,
  ResetPasswordBody,
  ShellMock,
  VerifyEmailBody,
} from "../product-preview";

type Chapter = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  mock: ComponentType;
};

type ChapterKey =
  | "signIn"
  | "signUp"
  | "verifyEmail"
  | "forgotPassword"
  | "resetEmail"
  | "resetPassword"
  | "shell"
  | "agent"
  | "account"
  | "inviteMembers"
  | "inviteEmail"
  | "adminPeople"
  | "adminInvites"
  | "adminInviteEmail"
  | "plansCatalog"
  | "plansAssign"
  | "mcp";

function chapterCopy(key: ChapterKey, t: TFunction) {
  return {
    eyebrow: t(`landing.chapters.${key}.eyebrow`),
    title: t(`landing.chapters.${key}.title`),
    body: t(`landing.chapters.${key}.body`),
  };
}

/** Body inside browser chrome — inbox labels go through i18n. */
function WindowMock({ label, children }: { label: string; children: ReactNode }) {
  const { t } = useTranslation();
  const bar = label === "inbox" ? t("landing.preview.window.inbox") : label;
  return <Window label={bar}>{children}</Window>;
}

function RegisterMock() {
  return (
    <WindowMock label="/register">
      <RegisterBody />
    </WindowMock>
  );
}
function VerifyEmailMock() {
  return (
    <WindowMock label="inbox">
      <VerifyEmailBody />
    </WindowMock>
  );
}
function ForgotPasswordMock() {
  return (
    <WindowMock label="/forgot-password">
      <ForgotPasswordBody />
    </WindowMock>
  );
}
function ResetEmailMock() {
  return (
    <WindowMock label="inbox">
      <ResetEmailBody />
    </WindowMock>
  );
}
function ResetPasswordMock() {
  return (
    <WindowMock label="/reset-password">
      <ResetPasswordBody />
    </WindowMock>
  );
}
function InviteMembersMock() {
  return (
    <WindowMock label="/app/acme/settings">
      <InviteMembersBody />
    </WindowMock>
  );
}
function InviteEmailMock() {
  return (
    <WindowMock label="inbox">
      <InviteEmailBody />
    </WindowMock>
  );
}
function AdminPeopleMock() {
  return (
    <WindowMock label="/admin/users">
      <AdminPeopleBody />
    </WindowMock>
  );
}
function AdminInvitesMock() {
  return (
    <WindowMock label="/admin/invites">
      <AdminInvitesBody />
    </WindowMock>
  );
}
function AdminInviteEmailMock() {
  return (
    <WindowMock label="inbox">
      <PlatformInviteEmailBody />
    </WindowMock>
  );
}
function PlansCatalogMock() {
  return (
    <WindowMock label="/admin/plans">
      <AdminPlansBody />
    </WindowMock>
  );
}
function PlansAssignMock() {
  return (
    <WindowMock label="/admin/tenants">
      <AdminTenantsPlanBody />
    </WindowMock>
  );
}

export type ProductAreaId =
  "auth" | "workspace" | "agent" | "account" | "tenants" | "billing" | "admin";

const areaChapterIds: Record<ProductAreaId, readonly string[]> = {
  auth: ["signIn", "signUp", "verifyEmail", "forgotPassword", "resetEmail", "resetPassword"],
  workspace: ["shell"],
  agent: ["agent"],
  account: ["account", "mcp"],
  tenants: ["inviteMembers", "inviteEmail"],
  billing: ["plansCatalog", "plansAssign"],
  admin: ["adminPeople", "adminInvites", "adminInviteEmail"],
};

/** One card per screen — no multi-step carousels. */
export function buildChapters(t: TFunction): Chapter[] {
  return [
    { id: "signIn", ...chapterCopy("signIn", t), mock: LoginMock },
    { id: "signUp", ...chapterCopy("signUp", t), mock: RegisterMock },
    { id: "verifyEmail", ...chapterCopy("verifyEmail", t), mock: VerifyEmailMock },
    { id: "forgotPassword", ...chapterCopy("forgotPassword", t), mock: ForgotPasswordMock },
    { id: "resetEmail", ...chapterCopy("resetEmail", t), mock: ResetEmailMock },
    { id: "resetPassword", ...chapterCopy("resetPassword", t), mock: ResetPasswordMock },
    { id: "shell", ...chapterCopy("shell", t), mock: ShellMock },
    { id: "agent", ...chapterCopy("agent", t), mock: AgentChatMock },
    { id: "account", ...chapterCopy("account", t), mock: AccountMock },
    { id: "inviteMembers", ...chapterCopy("inviteMembers", t), mock: InviteMembersMock },
    { id: "inviteEmail", ...chapterCopy("inviteEmail", t), mock: InviteEmailMock },
    { id: "adminPeople", ...chapterCopy("adminPeople", t), mock: AdminPeopleMock },
    { id: "adminInvites", ...chapterCopy("adminInvites", t), mock: AdminInvitesMock },
    { id: "adminInviteEmail", ...chapterCopy("adminInviteEmail", t), mock: AdminInviteEmailMock },
    { id: "plansCatalog", ...chapterCopy("plansCatalog", t), mock: PlansCatalogMock },
    { id: "plansAssign", ...chapterCopy("plansAssign", t), mock: PlansAssignMock },
    { id: "mcp", ...chapterCopy("mcp", t), mock: McpKeysMock },
  ];
}

/** Chapters for one Product deep-dive page. */
export function buildProductArea(area: ProductAreaId, t: TFunction): Chapter[] {
  const ids = new Set(areaChapterIds[area]);
  return buildChapters(t).filter((c) => ids.has(c.id));
}

/** One product chapter: copy on one side, a single static mock on the other. */
export function ChapterSection({ chapter, flip }: { chapter: Chapter; flip: boolean }) {
  const Mock = chapter.mock;
  return (
    <FeatureSplit
      flip={flip}
      eyebrow={chapter.eyebrow}
      title={chapter.title}
      body={chapter.body}
      visual={<Mock />}
    />
  );
}
