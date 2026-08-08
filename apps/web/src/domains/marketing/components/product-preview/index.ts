/** Static, faithful mockups of the product UI — no data or app imports. */

export {
  AgentChatMock,
  AgentChipsMock,
  AgentEmptyMock,
  AgentFabIdleMock,
  AgentFabBusyMock,
  AgentFabRecordingMock,
  AgentAudioMock,
  AgentExpandedMock,
  AgentShortcutsMock,
} from "./agent-mock";
export { ForgotPasswordBody, LoginMock, RegisterBody, ResetPasswordBody } from "./auth-mocks";
export {
  AdminInvitesBody,
  AdminPeopleBody,
  AdminPlansBody,
  AdminTenantsPlanBody,
} from "./admin-mocks";
export {
  InviteEmailBody,
  PlatformInviteEmailBody,
  ResetEmailBody,
  VerifyEmailBody,
} from "./email-mocks";
export { InviteMembersBody } from "./invite-mocks";
export {
  TenantIsolationMock,
  TenantOptionalMock,
  TenantGeneralMock,
  TenantMembersMock,
  TenantInvitesMock,
} from "./tenant-mocks";
export {
  McpKeysMock,
  McpCreatedKeyMock,
  McpExternalAgentMock,
  ShellMock,
  TenantSwitcherMock,
  UserMenuMock,
  TasksMock,
  AccountMock,
  ProfileMock,
  PasswordMock,
} from "./shell-mocks";
export type { Column } from "./schema-tables";
export {
  TableCard,
  AuthTables,
  TenantTables,
  PlansCatalog,
  UsageTables,
  ArticleTables,
  PlatformTables,
  TaskTable,
} from "./schema-tables";
export {
  EnvMock,
  MigrateMock,
  MigrateWhenMock,
  PostgresMock,
  SeedMock,
  TerminalMock,
  RenderMock,
  RenderBlueprintMock,
  RenderEnvMock,
  R2BucketsMock,
  R2BucketObjectsMock,
  R2BucketSettingsMock,
  R2ApiTokensMock,
  R2CreateTokenMock,
  OpenAiKeysMock,
  OpenAiCreateKeyMock,
  ResendKeysMock,
  ResendCreateKeyMock,
  ResendDomainsMock,
  ResendDomainDetailMock,
  GodaddyDnsMock,
  RenderCustomDomainsMock,
  RenderAddDomainMock,
  RenderDomainDnsMock,
} from "./ops-mocks";
