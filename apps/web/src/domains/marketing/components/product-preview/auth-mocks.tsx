import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BoxIcon } from "lucide-react";
import { Field, SubmitButton } from "./field";
import { Window } from "@app/ui/browser-window";

export function AuthBody({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-5 bg-muted/40 p-4 sm:p-8">
      <div className="flex items-center gap-2 font-semibold">
        <BoxIcon className="size-5" />
        {t("brand")}
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
  children: ReactNode;
  footer: string;
}) {
  return (
    <Window label={route}>
      <AuthBody {...body} />
    </Window>
  );
}

export function LoginMock() {
  const { t } = useTranslation();
  return (
    <AuthScreen
      route="/login"
      title={t("landing.preview.login.title")}
      description={t("landing.preview.login.description")}
      footer={t("landing.preview.login.footer")}
    >
      <Field label={t("landing.preview.email")} value={t("landing.preview.sample.youEmail")} />
      <Field label={t("landing.preview.password")} value="••••••••" mono />
      <SubmitButton label={t("landing.preview.login.submit")} />
    </AuthScreen>
  );
}

export function RegisterBody() {
  const { t } = useTranslation();
  return (
    <AuthBody
      title={t("landing.preview.register.title")}
      description={t("landing.preview.register.description")}
      footer={t("landing.preview.register.footer")}
    >
      <Field label={t("landing.preview.name")} value={t("landing.preview.sample.ada")} />
      <Field label={t("landing.preview.email")} value={t("landing.preview.sample.youEmail")} />
      <Field label={t("landing.preview.password")} value="••••••••" mono />
      <SubmitButton label={t("landing.preview.register.submit")} />
    </AuthBody>
  );
}

export function ForgotPasswordBody() {
  const { t } = useTranslation();
  return (
    <AuthBody
      title={t("landing.preview.forgot.title")}
      description={t("landing.preview.forgot.description")}
      footer={t("landing.preview.forgot.footer")}
    >
      <Field label={t("landing.preview.email")} value={t("landing.preview.sample.youEmail")} />
      <SubmitButton label={t("landing.preview.forgot.submit")} />
    </AuthBody>
  );
}

export function ResetPasswordBody() {
  const { t } = useTranslation();
  return (
    <AuthBody
      title={t("landing.preview.reset.title")}
      description={t("landing.preview.reset.description")}
      footer={t("landing.preview.reset.footer")}
    >
      <Field label={t("landing.preview.reset.newPassword")} value="••••••••" mono />
      <Field label={t("landing.preview.reset.confirmPassword")} value="••••••••" mono />
      <SubmitButton label={t("landing.preview.reset.submit")} />
    </AuthBody>
  );
}
