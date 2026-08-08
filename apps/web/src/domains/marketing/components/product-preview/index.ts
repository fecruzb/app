/** Static, faithful mockups of the product UI — no data or app imports. */

export { AgentChatMock } from "./agent-mock";
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
export { McpKeysMock, ShellMock, TasksMock, AccountMock } from "./shell-mocks";
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
} from "./ops-mocks";
