import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BoxIcon, MailIcon } from "lucide-react";

export function EmailBody({
  subject,
  heading,
  body,
  cta,
}: {
  subject: string;
  heading: string;
  body: ReactNode;
  cta: string;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{subject}</p>
          <p className="truncate text-xs text-muted-foreground">
            {t("brand")} &lt;no-reply@appbase.dev&gt; → {t("landing.preview.sample.youEmail")}
          </p>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          {t("landing.preview.now")}
        </span>
      </div>
      <div className="bg-muted/40 p-4 sm:p-6">
        <div className="mx-auto max-w-sm rounded-xl border bg-card p-5 text-center shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-center gap-2 font-semibold">
            <BoxIcon className="size-5" />
            {t("brand")}
          </div>
          <p className="text-base font-semibold">{heading}</p>
          <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          <div className="mt-5 flex h-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground">
            {cta}
          </div>
        </div>
      </div>
    </>
  );
}

export function VerifyEmailBody() {
  const { t } = useTranslation();
  return (
    <EmailBody
      subject={t("landing.preview.verifyEmail.subject")}
      heading={t("landing.preview.verifyEmail.heading")}
      body={t("landing.preview.verifyEmail.body", {
        name: t("landing.preview.sample.adaFirst"),
      })}
      cta={t("landing.preview.verifyEmail.cta")}
    />
  );
}

export function ResetEmailBody() {
  const { t } = useTranslation();
  return (
    <EmailBody
      subject={t("landing.preview.resetEmail.subject")}
      heading={t("landing.preview.resetEmail.heading")}
      body={t("landing.preview.resetEmail.body")}
      cta={t("landing.preview.resetEmail.cta")}
    />
  );
}

export function InviteEmailBody() {
  const { t } = useTranslation();
  const tenant = t("landing.preview.sample.tenant");
  const name = t("landing.preview.sample.ada");
  return (
    <EmailBody
      subject={t("landing.preview.inviteEmail.subject", { tenant })}
      heading={t("landing.preview.inviteEmail.heading", { tenant })}
      body={
        <>
          {t("landing.preview.inviteEmail.bodyBefore", { name })}
          <span className="font-medium text-foreground">{tenant}</span>
          {t("landing.preview.inviteEmail.bodyAfter")}
        </>
      }
      cta={t("landing.preview.inviteEmail.cta")}
    />
  );
}

export function PlatformInviteEmailBody() {
  const { t } = useTranslation();
  return (
    <EmailBody
      subject={t("landing.preview.platformInviteEmail.subject")}
      heading={t("landing.preview.platformInviteEmail.heading")}
      body={t("landing.preview.platformInviteEmail.bodyBefore", {
        name: t("landing.preview.sample.ada"),
      })}
      cta={t("landing.preview.platformInviteEmail.cta")}
    />
  );
}
