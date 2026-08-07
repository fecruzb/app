/** Static, faithful mockups of the product UI — no data or app imports. */

export { WindowBar } from "./window";
export { AgentChatMock } from "./agent-mock";
export { LoginMock } from "./auth-mocks";
export { McpKeysMock, ShellMock, TasksMock, AccountMock } from "./shell-mocks";
export type { Column } from "./schema-tables";
export {
  TableCard,
  AuthTables,
  TenantTables,
  PlansCatalog,
  UsageTables,
  ImageTables,
  PlatformTables,
  TaskTable,
} from "./schema-tables";
export { EnvMock, TerminalMock, RenderMock } from "./ops-mocks";
export type { Screen } from "./flows";
export { flows } from "./flows";
