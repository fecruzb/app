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
<NavLink to="/code">
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
      <NavItem variant="header">Code</NavItem>
      <NavItem variant="header" active>Product</NavItem>
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

export const progressSnippet = `import { Progress } from "@app/ui/progress";

<Progress value={74} />
<Progress value={65} size="lg" />
<Progress value={43} variant="destructive" showValue className="w-36" />`;

export const sliderSnippet = `import { useState } from "react";
import { Badge } from "@app/ui/badge";
import { Slider } from "@app/ui/slider";

const [value, setValue] = useState([20]);

<div className="space-y-3 rounded-2xl border p-5 shadow-xs">
  <div className="flex items-center justify-between gap-3">
    <p className="text-sm font-semibold">Temperature</p>
    <Badge variant="outline">Cold</Badge>
  </div>
  <Slider value={value} onValueChange={setValue} max={100} step={1} />
  <p className="text-right text-xs text-muted-foreground">Auto</p>
  <p className="text-sm text-muted-foreground">
    Automatic: {value[0]}
  </p>
</div>`;

export const labelSnippet = `import { Label } from "@app/ui/label";
import { Input } from "@app/ui/input";

<Label htmlFor="name">Name</Label>
<Input id="name" placeholder="Ada Lovelace" />`;

export const inputSnippet = `import { Input } from "@app/ui/input";

<Input placeholder="Ada Lovelace" />
<Input type="email" placeholder="ada@example.com" />
<Input disabled placeholder="Disabled" />`;

export const textareaSnippet = `import { Textarea } from "@app/ui/textarea";

<Textarea placeholder="Optional notes…" />
<Textarea disabled placeholder="Disabled" />`;

export const comboboxSnippet = `import { useState } from "react";
import { Combobox, type ComboboxOption } from "@app/ui/combobox";
import { GlobeIcon, SmartphoneIcon, MonitorIcon } from "lucide-react";

const options: ComboboxOption[] = [
  { value: "web", label: "Web", icon: <GlobeIcon />, group: "Platform" },
  { value: "mobile", label: "Mobile", icon: <SmartphoneIcon />, group: "Platform" },
  { value: "desktop", label: "Desktop", icon: <MonitorIcon />, group: "Platform" },
];

const [value, setValue] = useState("web");

<Combobox
  options={options}
  value={value}
  onValueChange={setValue}
  placeholder="Select a platform…"
  searchPlaceholder="Search…"
  emptyMessage="No platform found."
  clearable
/>`;

export const checkboxSnippet = `import { Checkbox } from "@app/ui/checkbox";
import { Field, FieldLabel } from "@app/ui/field";

<Field orientation="horizontal">
  <Checkbox id="terms" />
  <FieldLabel htmlFor="terms">Accept terms</FieldLabel>
</Field>`;

export const radioGroupSnippet = `import { Field, FieldLabel } from "@app/ui/field";
import { RadioGroup, RadioGroupItem } from "@app/ui/radio-group";

{/* vertical (default) */}
<RadioGroup defaultValue="member">
  <Field orientation="horizontal">
    <RadioGroupItem value="member" id="r-member" />
    <FieldLabel htmlFor="r-member">Member</FieldLabel>
  </Field>
  <Field orientation="horizontal">
    <RadioGroupItem value="admin" id="r-admin" />
    <FieldLabel htmlFor="r-admin">Admin</FieldLabel>
  </Field>
</RadioGroup>

{/* inline row */}
<RadioGroup defaultValue="web" orientation="horizontal">
  <Field orientation="horizontal">
    <RadioGroupItem value="web" id="r-web" />
    <FieldLabel htmlFor="r-web">Web</FieldLabel>
  </Field>
  <Field orientation="horizontal">
    <RadioGroupItem value="mobile" id="r-mobile" />
    <FieldLabel htmlFor="r-mobile">Mobile</FieldLabel>
  </Field>
</RadioGroup>`;

export const switchSnippet = `import { Field, FieldLabel } from "@app/ui/field";
import { Switch } from "@app/ui/switch";

<Field orientation="horizontal">
  <Switch id="notifications" />
  <FieldLabel htmlFor="notifications">Email notifications</FieldLabel>
</Field>`;

export const fieldSnippet = `import { Checkbox } from "@app/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@app/ui/field";
import { Input } from "@app/ui/input";
import { RadioGroup, RadioGroupItem } from "@app/ui/radio-group";
import { Switch } from "@app/ui/switch";

{/* Same row — Input h-9 + Field horizontal h-9 */}
<div className="flex items-center gap-3">
  <Input className="min-w-0 flex-1" placeholder="Ada Lovelace" />
  <Field orientation="horizontal">
    <Checkbox id="terms" />
    <FieldLabel htmlFor="terms">Accept terms</FieldLabel>
  </Field>
</div>

<div className="flex items-center gap-3">
  <Input className="min-w-0 flex-1" type="email" />
  <RadioGroup defaultValue="member" orientation="horizontal">
    <Field orientation="horizontal">
      <RadioGroupItem value="member" id="r-member" />
      <FieldLabel htmlFor="r-member">Member</FieldLabel>
    </Field>
    <Field orientation="horizontal">
      <RadioGroupItem value="admin" id="r-admin" />
      <FieldLabel htmlFor="r-admin">Admin</FieldLabel>
    </Field>
  </RadioGroup>
</div>

{/* Labeled input + toggle — items-end aligns the h-9 row with the input */}
<div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" type="email" />
  </Field>
  <Field orientation="horizontal">
    <Switch id="notify" />
    <FieldLabel htmlFor="notify">Notify</FieldLabel>
  </Field>
</div>`;

export const formSnippet = `import { useState } from "react";
import { Button } from "@app/ui/button";
import { Checkbox } from "@app/ui/checkbox";
import { Combobox } from "@app/ui/combobox";
import { Field, FieldGroup, FieldLabel } from "@app/ui/field";
import { Input } from "@app/ui/input";
import { RadioGroup, RadioGroupItem } from "@app/ui/radio-group";
import { Switch } from "@app/ui/switch";
import { Textarea } from "@app/ui/textarea";

<form className="grid gap-4">
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="name">Name</FieldLabel>
      <Input id="name" />
    </Field>
    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
      <Field>
        <FieldLabel htmlFor="platform">Platform</FieldLabel>
        <Combobox id="platform" options={options} value={platform} onValueChange={setPlatform} />
      </Field>
      <Field orientation="horizontal">
        <Switch id="notify" checked={notify} onCheckedChange={setNotify} />
        <FieldLabel htmlFor="notify">Notify</FieldLabel>
      </Field>
    </div>
    <Field>
      <FieldLabel>Role</FieldLabel>
      <RadioGroup value={role} onValueChange={setRole} orientation="horizontal">
        <Field orientation="horizontal">
          <RadioGroupItem value="member" id="role-member" />
          <FieldLabel htmlFor="role-member">Member</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem value="admin" id="role-admin" />
          <FieldLabel htmlFor="role-admin">Admin</FieldLabel>
        </Field>
      </RadioGroup>
    </Field>
    <Field orientation="horizontal">
      <Checkbox id="terms" checked={terms} onCheckedChange={…} />
      <FieldLabel htmlFor="terms">Accept terms</FieldLabel>
    </Field>
  </FieldGroup>
  <Button type="submit">Continue</Button>
</form>`;

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

export const barChartSnippet = `import { BarChart } from "@app/ui/chart";

const data = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
];

<BarChart
  data={data}
  index="month"
  series={["desktop", "mobile"]}
  seriesLabel={{ desktop: "Desktop", mobile: "Mobile" }}
/>`;

export const lineChartSnippet = `import { LineChart } from "@app/ui/chart";

<LineChart
  data={data}
  index="month"
  series={["desktop", "mobile"]}
  seriesLabel={{ desktop: "Desktop", mobile: "Mobile" }}
/>`;

export const pieChartSnippet = `import { PieChart } from "@app/ui/chart";

const data = [
  { name: "Chrome", value: 275 },
  { name: "Safari", value: 200 },
  { name: "Firefox", value: 187 },
];

// innerRadius turns it into a donut
<PieChart data={data} innerRadius={60} />`;
