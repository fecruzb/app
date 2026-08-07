import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@app/ui/avatar";
import { Button } from "@app/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@app/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@app/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@app/ui/dropdown-menu";
import { UiDemoBlock } from "./ui-demo-block";
import {
  avatarSnippet,
  cardSnippet,
  dialogSnippet,
  dropdownSnippet,
} from "./ui-snippets";

/** Card, Avatar, Dialog, and Dropdown demos. */
export function OverlaysSection() {
  const { t } = useTranslation();

  return (
    <>
      <UiDemoBlock
        title={t("landing.ui.sections.card.title")}
        description={t("landing.ui.sections.card.description")}
        importPath='import { Card, CardHeader, CardTitle } from "@app/ui/card"'
        filename="card.tsx"
        code={cardSnippet}
      >
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle>{t("landing.ui.demo.cardTitle")}</CardTitle>
            <CardDescription>{t("landing.ui.demo.cardDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("landing.ui.demo.cardBody")}</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">{t("landing.ui.demo.continue")}</Button>
          </CardFooter>
        </Card>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.avatar.title")}
        description={t("landing.ui.sections.avatar.description")}
        importPath='import { Avatar, AvatarFallback } from "@app/ui/avatar"'
        filename="avatar.tsx"
        code={avatarSnippet}
      >
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar className="size-10">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar className="size-12">
            <AvatarFallback>UI</AvatarFallback>
          </Avatar>
        </div>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.dialog.title")}
        description={t("landing.ui.sections.dialog.description")}
        importPath='import { Dialog, DialogTrigger, DialogContent } from "@app/ui/dialog"'
        filename="dialog.tsx"
        code={dialogSnippet}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">{t("landing.ui.demo.openDialog")}</Button>
          </DialogTrigger>
          <DialogContent closeLabel={t("common.close")}>
            <DialogHeader>
              <DialogTitle>{t("landing.ui.demo.dialogTitle")}</DialogTitle>
              <DialogDescription>{t("landing.ui.demo.dialogDescription")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button>{t("landing.ui.demo.continue")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.dropdown.title")}
        description={t("landing.ui.sections.dropdown.description")}
        importPath='import { DropdownMenu, DropdownMenuTrigger } from "@app/ui/dropdown-menu"'
        filename="dropdown-menu.tsx"
        code={dropdownSnippet}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{t("landing.ui.demo.openMenu")}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>{t("landing.ui.demo.menuLabel")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t("landing.ui.demo.menuItem1")}</DropdownMenuItem>
            <DropdownMenuItem>{t("landing.ui.demo.menuItem2")}</DropdownMenuItem>
            <DropdownMenuItem>{t("landing.ui.demo.menuItem3")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </UiDemoBlock>
    </>
  );
}
