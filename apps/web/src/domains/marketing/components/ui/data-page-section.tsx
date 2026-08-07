import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@app/ui/avatar";
import { Badge } from "@app/ui/badge";
import { Button } from "@app/ui/button";
import { DataTable, type DataTableColumn } from "@app/ui/data-table";
import { EmptyState } from "@app/ui/empty-state";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@app/ui/tabs";
import { UiDemoBlock } from "./ui-demo-block";
import { dataTableSnippet, pageSnippet, tabsSnippet } from "./ui-snippets";

/** Tabs, DataTable, and page chrome (header / empty / loading) demos. */
export function DataPageSection() {
  const { t } = useTranslation();

  return (
    <>
      <UiDemoBlock
        title={t("landing.ui.sections.tabs.title")}
        description={t("landing.ui.sections.tabs.description")}
        importPath='import { Tabs, TabsList, TabsTrigger, TabsContent } from "@app/ui/tabs"'
        filename="tabs.tsx"
        code={tabsSnippet}
      >
        <Tabs defaultValue="account" className="w-full max-w-lg">
          <TabsList>
            <TabsTrigger value="account">{t("landing.ui.demo.tabsAccount")}</TabsTrigger>
            <TabsTrigger value="security">{t("landing.ui.demo.tabsSecurity")}</TabsTrigger>
            <TabsTrigger value="billing">{t("landing.ui.demo.tabsBilling")}</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">{t("landing.ui.demo.tabsAccountBody")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="ui-tabs-name">{t("landing.ui.demo.name")}</Label>
                <Input id="ui-tabs-name" defaultValue={t("landing.ui.demo.userName")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ui-tabs-email">{t("landing.ui.demo.tableEmail")}</Label>
                <Input
                  id="ui-tabs-email"
                  type="email"
                  defaultValue={t("landing.ui.demo.userEmail")}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Avatar className="size-10">
                <AvatarFallback>{t("landing.ui.demo.userInitials")}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t("landing.ui.demo.userName")}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t("landing.ui.demo.userEmail")}
                </p>
              </div>
            </div>
            <Button type="button" size="sm">
              {t("landing.ui.demo.tabsSave")}
            </Button>
          </TabsContent>
          <TabsContent value="security" className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">{t("landing.ui.demo.tabsSecurityBody")}</p>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ui-tabs-current">{t("landing.ui.demo.tabsCurrentPassword")}</Label>
                <Input id="ui-tabs-current" type="password" defaultValue="••••••••" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ui-tabs-new">{t("landing.ui.demo.tabsNewPassword")}</Label>
                <Input id="ui-tabs-new" type="password" placeholder="••••••••" />
              </div>
            </div>
            <Button type="button" size="sm" variant="outline">
              {t("landing.ui.demo.tabsUpdatePassword")}
            </Button>
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">{t("landing.ui.demo.tabsSessionsTitle")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("landing.ui.demo.tabsSessionsBody")}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="billing" className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">{t("landing.ui.demo.tabsBillingBody")}</p>
            <div className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{t("landing.ui.demo.tabsPlanTitle")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("landing.ui.demo.tabsPlanBody")}
                  </p>
                </div>
                <Badge variant="secondary">{t("landing.ui.demo.tableRoleOwner")}</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{t("landing.ui.demo.tabsPlanSeats")}</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {t("landing.ui.demo.tabsPlanSeatsValue")}
                  </p>
                </div>
                <div className="rounded-md bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{t("landing.ui.demo.tabsPlanUsage")}</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {t("landing.ui.demo.tabsPlanUsageValue")}
                  </p>
                </div>
              </div>
            </div>
            <Button type="button" size="sm">
              {t("landing.ui.demo.tabsManagePlan")}
            </Button>
          </TabsContent>
        </Tabs>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.dataTable.title")}
        description={t("landing.ui.sections.dataTable.description")}
        importPath='import { DataTable } from "@app/ui/data-table"'
        filename="data-table.tsx"
        code={dataTableSnippet}
      >
        <DemoDataTable />
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.page.title")}
        description={t("landing.ui.sections.page.description")}
        importPath='import { PageHeader } from "@app/ui/page-header"'
        filename="page.tsx"
        code={pageSnippet}
      >
        <div className="space-y-6">
          <PageHeader
            title={t("landing.ui.demo.pageTitle")}
            description={t("landing.ui.demo.pageDescription")}
          />
          <EmptyState>{t("landing.ui.demo.empty")}</EmptyState>
          <div className="rounded-lg border border-dashed p-4">
            <PageLoading />
          </div>
        </div>
      </UiDemoBlock>
    </>
  );
}

type DemoMember = {
  id: string;
  name: string;
  email: string;
  roleKey: "owner" | "admin" | "member";
};

const DEMO_MEMBERS: DemoMember[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", roleKey: "owner" },
  { id: "2", name: "Alan Turing", email: "alan@example.com", roleKey: "admin" },
  { id: "3", name: "Grace Hopper", email: "grace@example.com", roleKey: "member" },
  { id: "4", name: "Katherine Johnson", email: "katherine@example.com", roleKey: "member" },
  { id: "5", name: "Margaret Hamilton", email: "margaret@example.com", roleKey: "admin" },
  { id: "6", name: "Tim Berners-Lee", email: "tim@example.com", roleKey: "member" },
  { id: "7", name: "Linus Torvalds", email: "linus@example.com", roleKey: "member" },
  { id: "8", name: "Barbara Liskov", email: "barbara@example.com", roleKey: "admin" },
];

function DemoDataTable() {
  const { t } = useTranslation();

  const columns: DataTableColumn<DemoMember>[] = [
    {
      id: "name",
      header: t("landing.ui.demo.tableName"),
      sortValue: (row) => row.name,
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      id: "email",
      header: t("landing.ui.demo.tableEmail"),
      sortValue: (row) => row.email,
      cell: (row) => <span className="text-muted-foreground">{row.email}</span>,
    },
    {
      id: "role",
      header: t("landing.ui.demo.tableRole"),
      sortValue: (row) => row.roleKey,
      cell: (row) => (
        <Badge variant="secondary">
          {t(
            row.roleKey === "owner"
              ? "landing.ui.demo.tableRoleOwner"
              : row.roleKey === "admin"
                ? "landing.ui.demo.tableRoleAdmin"
                : "landing.ui.demo.tableRoleMember",
          )}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={DEMO_MEMBERS}
      getRowId={(row) => row.id}
      pageSize={5}
      pagination={{
        previousLabel: t("landing.ui.demo.tablePrevious"),
        nextLabel: t("landing.ui.demo.tableNext"),
        pageLabel: (page, pages) => t("landing.ui.demo.tablePage", { page, pages }),
      }}
      empty={<EmptyState>{t("landing.ui.demo.tableEmpty")}</EmptyState>}
    />
  );
}
