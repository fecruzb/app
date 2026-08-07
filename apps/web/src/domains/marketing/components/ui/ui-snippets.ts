/**
 * Usage snippets shown on the UI showcase — short, realistic call sites.
 * Keep in sync with the live demos on UiPage.
 */

export const brandSnippet = `import { Link } from "react-router-dom";
import { BoxIcon } from "lucide-react";
import { Brand } from "@app/ui/brand";

<Link to="/">
  <Brand icon={<BoxIcon className="size-5 text-primary" />}>
    App Base
  </Brand>
</Link>

<Brand
  icon={<BoxIcon className="size-5 shrink-0 text-primary" />}
  subtitle="Platform admin"
>
  App Base
</Brand>`;

export const navItemSnippet = `import { NavLink } from "react-router-dom";
import { HomeIcon } from "lucide-react";
import { NavItem } from "@app/ui/nav-item";

{/* Header variant */}
<NavLink to="/ui">
  {({ isActive }) => (
    <NavItem variant="header" active={isActive}>UI</NavItem>
  )}
</NavLink>

{/* Sidebar variant */}
<NavLink to="/app/acme" end>
  {({ isActive }) => (
    <NavItem variant="sidebar" active={isActive} icon={<HomeIcon />}>
      Home
    </NavItem>
  )}
</NavLink>`;

export const siteHeaderSnippet = `import { Link } from "react-router-dom";
import { Brand } from "@app/ui/brand";
import { Button } from "@app/ui/button";
import { NavItem } from "@app/ui/nav-item";
import { SiteHeader } from "@app/ui/site-header";

<SiteHeader
  brand={
    <Link to="/">
      <Brand icon={<BoxIcon className="size-5 text-primary" />}>
        App Base
      </Brand>
    </Link>
  }
  nav={
    <>
      <NavItem variant="header">Foundations</NavItem>
      <NavItem variant="header" active>UI</NavItem>
    </>
  }
  actions={
    <>
      <ThemeControls />
      <Button variant="ghost" asChild>
        <Link to="/login">Sign in</Link>
      </Button>
    </>
  }
/>`;

export const sidebarSnippet = `import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@app/ui/resizable";
import { Brand } from "@app/ui/brand";
import { NavItem } from "@app/ui/nav-item";
import {
  Sidebar,
  SidebarHeader,
  SidebarNav,
  SidebarFooter,
} from "@app/ui/sidebar";
import { UserMenuButton } from "@app/ui/user-menu-button";

<ResizablePanelGroup orientation="horizontal" className="h-svh">
  <ResizablePanel defaultSize={256} minSize={200} maxSize={400}>
    <Sidebar className="h-full">
      <SidebarHeader>
        <Brand icon={<BoxIcon className="size-5 text-primary" />}>
          App Base
        </Brand>
      </SidebarHeader>
      <SidebarNav>
        <NavItem variant="sidebar" active icon={<HomeIcon />}>Home</NavItem>
        <NavItem variant="sidebar" icon={<CheckSquareIcon />}>Tasks</NavItem>
      </SidebarNav>
      <SidebarFooter>
        <ThemeControls menuSide="top" menuAlign="bar" />
        <UserMenuButton name="Ada Lovelace" email="ada@example.com" initials="AL" />
      </SidebarFooter>
    </Sidebar>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel minSize={360}>{/* main */}</ResizablePanel>
</ResizablePanelGroup>`;

export const sidebarShellSnippet = `import { SidebarShell } from "@app/ui/sidebar-shell";

// \`sidebar\` is the composed <Sidebar> from the section above.
<SidebarShell
  sidebar={<AppSidebar />}
  resizable={{ id: "app-sidebar", storage: localStorage }}
>
  <Outlet />
</SidebarShell>`;

export const navbarShellSnippet = `import { NavbarShell } from "@app/ui/navbar-shell";

// brand / nav / actions are the same SiteHeader slots from above.
<NavbarShell
  brand={brand}
  nav={nav}
  actions={actions}
  footer={<SiteFooter />}
>
  {children}
</NavbarShell>`;

export const authShellSnippet = `import { AuthShell } from "@app/ui/auth-shell";

// \`brand\` is the same Brand mark from above.
// Each auth route fills title / description / children (the form).
<AuthShell
  brand={brand}
  title="Sign in"
  description="Enter your email to continue."
  footer={<>Don't have an account? Register</>}
>
  <Outlet />
</AuthShell>`;

export const userMenuSnippet = `import { UserMenuButton } from "@app/ui/user-menu-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@app/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <UserMenuButton
      name="Ada Lovelace"
      email="ada@example.com"
      initials="AL"
    />
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56" side="top">
    <DropdownMenuItem>My account</DropdownMenuItem>
    <DropdownMenuItem>Sign out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`;

export const iconButtonSnippet = `import { Button } from "@app/ui/button";
import { LanguagesIcon, MoonIcon, PaletteIcon } from "lucide-react";

<Button variant="ghost" size="icon" aria-label="Language">
  <LanguagesIcon />
</Button>
<Button variant="ghost" size="icon" aria-label="Theme">
  <PaletteIcon />
</Button>
<Button variant="ghost" size="icon" aria-label="Mode">
  <MoonIcon />
</Button>`;

export const buttonSnippet = `import { Button } from "@app/ui/button";

<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon" aria-label="More">
  <MoreHorizontalIcon />
</Button>`;

export const badgeSnippet = `import { Badge } from "@app/ui/badge";

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>`;

export const formSnippet = `import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { Textarea } from "@app/ui/textarea";

<div className="grid gap-2">
  <Label htmlFor="name">Name</Label>
  <Input id="name" placeholder="Ada Lovelace" />
</div>
<div className="grid gap-2">
  <Label htmlFor="notes">Notes</Label>
  <Textarea id="notes" placeholder="Optional notes…" />
</div>`;

export const cardSnippet = `import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@app/ui/card";
import { Button } from "@app/ui/button";

<Card>
  <CardHeader>
    <CardTitle>Workspace plan</CardTitle>
    <CardDescription>Seats and AI usage for this tenant.</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">…</p>
  </CardContent>
  <CardFooter>
    <Button size="sm">Continue</Button>
  </CardFooter>
</Card>`;

export const avatarSnippet = `import { Avatar, AvatarFallback } from "@app/ui/avatar";

<Avatar>
  <AvatarFallback>AB</AvatarFallback>
</Avatar>
<Avatar className="size-10">
  <AvatarFallback>JD</AvatarFallback>
</Avatar>`;

export const dialogSnippet = `import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@app/ui/dialog";
import { Button } from "@app/ui/button";

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open dialog</Button>
  </DialogTrigger>
  <DialogContent closeLabel="Close">
    <DialogHeader>
      <DialogTitle>Confirm action</DialogTitle>
      <DialogDescription>…</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button>Continue</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`;

export const dropdownSnippet = `import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@app/ui/dropdown-menu";
import { Button } from "@app/ui/button";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="start">
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuItem>Archive</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`;

export const pageSnippet = `import { PageHeader } from "@app/ui/page-header";
import { EmptyState } from "@app/ui/empty-state";
import { PageLoading } from "@app/ui/page-loading";

<PageHeader title="Tasks" description="…" />
{isLoading ? (
  <PageLoading />
) : items.length === 0 ? (
  <EmptyState>No items yet.</EmptyState>
) : (
  /* list */
  null
)}`;

export const dataTableSnippet = `import { DataTable, type DataTableColumn } from "@app/ui/data-table";
import { Badge } from "@app/ui/badge";
import { EmptyState } from "@app/ui/empty-state";

type Member = { id: string; name: string; email: string; role: string };

const columns: DataTableColumn<Member>[] = [
  { id: "name", header: "Name", sortValue: (row) => row.name, cell: (row) => row.name },
  { id: "email", header: "Email", sortValue: (row) => row.email, cell: (row) => row.email },
  {
    id: "role",
    header: "Role",
    sortValue: (row) => row.role,
    cell: (row) => <Badge variant="secondary">{row.role}</Badge>,
  },
];

<DataTable
  columns={columns}
  data={members}
  getRowId={(row) => row.id}
  pageSize={5}
  pagination={{
    previousLabel: t("common.previous"),
    nextLabel: t("common.next"),
    pageLabel: (page, pages) => t("common.pageOf", { page, pages }),
  }}
  empty={<EmptyState>No rows yet.</EmptyState>}
/>`;

export const tabsSnippet = `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@app/ui/tabs";

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
    <TabsTrigger value="billing">Billing</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    {/* profile fields + save */}
  </TabsContent>
  <TabsContent value="security">
    {/* password + sessions */}
  </TabsContent>
  <TabsContent value="billing">
    {/* plan + usage */}
  </TabsContent>
</Tabs>`;
