import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LanguagesIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PaletteIcon,
  SunIcon,
} from "lucide-react";
import { Badge } from "@app/ui/badge";
import { Button } from "@app/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@app/ui/dropdown-menu";
import { Progress } from "@app/ui/progress";
import { Slider } from "@app/ui/slider";
import { UserMenuButton } from "@app/ui/user-menu-button";
import { UiDemoBlock } from "./ui-demo-block";
import {
  badgeSnippet,
  buttonSnippet,
  iconButtonSnippet,
  progressSnippet,
  sliderSnippet,
  userMenuSnippet,
} from "./ui-snippets";

/** UserMenu, icon button, Button, Badge, Progress, and Slider demos. */
export function ControlsSection() {
  const { t } = useTranslation();
  const [darkDemo, setDarkDemo] = useState(false);
  const [sliderValue, setSliderValue] = useState([20]);

  return (
    <>
      <UiDemoBlock
        title={t("landing.ui.sections.userMenu.title")}
        description={t("landing.ui.sections.userMenu.description")}
        importPath='import { UserMenuButton } from "@app/ui/user-menu-button"'
        filename="user-menu-button.tsx"
        code={userMenuSnippet}
      >
        <div className="max-w-xs">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <UserMenuButton
                name={t("landing.ui.demo.userName")}
                email={t("landing.ui.demo.userEmail")}
                initials={t("landing.ui.demo.userInitials")}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>{t("landing.ui.demo.menuLabel")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t("landing.ui.demo.menuItem1")}</DropdownMenuItem>
              <DropdownMenuItem>{t("landing.ui.demo.menuItem2")}</DropdownMenuItem>
              <DropdownMenuItem>{t("landing.ui.demo.menuItem3")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.iconButton.title")}
        description={t("landing.ui.sections.iconButton.description")}
        importPath='import { Button } from "@app/ui/button"'
        filename="icon-button.tsx"
        code={iconButtonSnippet}
      >
        <div className="flex flex-wrap gap-1">
          <Button variant="ghost" size="icon" aria-label={t("landing.ui.demo.language")}>
            <LanguagesIcon />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t("landing.ui.demo.theme")}>
            <PaletteIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("landing.ui.demo.mode")}
            onClick={() => setDarkDemo((v) => !v)}
          >
            {darkDemo ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.button.title")}
        description={t("landing.ui.sections.button.description")}
        importPath='import { Button } from "@app/ui/button"'
        filename="button.tsx"
        code={buttonSnippet}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button>{t("landing.ui.demo.default")}</Button>
            <Button variant="secondary">{t("landing.ui.demo.secondary")}</Button>
            <Button variant="outline">{t("landing.ui.demo.outline")}</Button>
            <Button variant="ghost">{t("landing.ui.demo.ghost")}</Button>
            <Button variant="destructive">{t("landing.ui.demo.destructive")}</Button>
            <Button variant="link">{t("landing.ui.demo.link")}</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">{t("landing.ui.demo.small")}</Button>
            <Button size="default">{t("landing.ui.demo.default")}</Button>
            <Button size="lg">{t("landing.ui.demo.large")}</Button>
            <Button size="icon" aria-label={t("landing.ui.demo.more")}>
              <MoreHorizontalIcon />
            </Button>
          </div>
        </div>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.badge.title")}
        description={t("landing.ui.sections.badge.description")}
        importPath='import { Badge } from "@app/ui/badge"'
        filename="badge.tsx"
        code={badgeSnippet}
      >
        <div className="flex flex-wrap gap-2">
          <Badge>{t("landing.ui.demo.default")}</Badge>
          <Badge variant="secondary">{t("landing.ui.demo.secondary")}</Badge>
          <Badge variant="outline">{t("landing.ui.demo.outline")}</Badge>
          <Badge variant="destructive">{t("landing.ui.demo.destructive")}</Badge>
        </div>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.progress.title")}
        description={t("landing.ui.sections.progress.description")}
        importPath='import { Progress } from "@app/ui/progress"'
        filename="progress.tsx"
        code={progressSnippet}
      >
        <div className="flex w-full max-w-md flex-col gap-6">
          <Progress value={74} size="lg" />
          <div className="divide-y rounded-lg border">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-sm font-medium">{t("landing.ui.demo.progressLabel1")}</span>
              <Progress value={74} size="sm" showValue className="w-32" />
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-sm font-medium">{t("landing.ui.demo.progressLabel2")}</span>
              <Progress value={65} size="sm" showValue className="w-32" />
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-sm font-medium">{t("landing.ui.demo.progressLabel3")}</span>
              <Progress
                value={43}
                size="sm"
                variant="destructive"
                showValue
                className="w-32"
              />
            </div>
          </div>
        </div>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.slider.title")}
        description={t("landing.ui.sections.slider.description")}
        importPath='import { Slider } from "@app/ui/slider"'
        filename="slider.tsx"
        code={sliderSnippet}
      >
        <div className="w-full max-w-md space-y-3 rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">{t("landing.ui.demo.sliderTitle")}</p>
            <Badge variant="outline">{t("landing.ui.demo.sliderBadge")}</Badge>
          </div>
          <Slider
            value={sliderValue}
            onValueChange={setSliderValue}
            max={100}
            step={1}
            aria-label={t("landing.ui.demo.sliderTitle")}
          />
          <p className="text-right text-xs text-muted-foreground">
            {t("landing.ui.demo.sliderHint")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("landing.ui.demo.sliderFooter", { value: sliderValue[0] })}
          </p>
        </div>
      </UiDemoBlock>
    </>
  );
}
