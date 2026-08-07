import { useTranslation } from "react-i18next";
import { ChevronsUpDownIcon } from "lucide-react";

export function InviteMembersBody() {
  const { t } = useTranslation();
  const members = [
    {
      name: t("landing.preview.sample.ada"),
      email: t("landing.preview.sample.adaEmail"),
      role: t("landing.preview.roles.owner"),
      self: true,
    },
    {
      name: t("landing.preview.sample.alan"),
      email: t("landing.preview.sample.alanEmail"),
      role: t("landing.preview.roles.admin"),
      self: false,
    },
  ];
  return (
    <div className="space-y-4 p-5">
      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">{t("landing.preview.invites.title")}</p>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.invites.description")}
          </p>
        </div>
        <div className="flex items-end gap-2 p-4">
          <div className="flex-1">
            <p className="mb-1 text-xs font-medium">{t("landing.preview.invites.email")}</p>
            <div className="flex h-9 items-center rounded-md border px-3 text-sm text-muted-foreground">
              {t("landing.preview.sample.samAcmeEmail")}
            </div>
          </div>
          <div className="flex h-9 items-center gap-1 rounded-md border px-3 text-sm text-muted-foreground">
            {t("landing.preview.roles.member")}
            <ChevronsUpDownIcon className="size-3.5" />
          </div>
          <div className="flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            {t("landing.preview.invites.invite")}
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">{t("landing.preview.invites.membersTitle")}</p>
          <p className="text-xs text-muted-foreground">
            {t("landing.preview.invites.membersDescription")}
          </p>
        </div>
        <div className="divide-y">
          {members.map((m) => (
            <div key={m.email} className="flex items-center gap-3 px-4 py-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {m.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {m.name}
                  {m.self && (
                    <span className="text-muted-foreground">
                      {" "}
                      {t("landing.preview.invites.you")}
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
              </div>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
