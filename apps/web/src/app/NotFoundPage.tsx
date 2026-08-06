import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@app/ui/button";

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="text-xl font-semibold">{t("notFound.title")}</h1>
      <Button variant="outline" asChild>
        <Link to="/">{t("notFound.backHome")}</Link>
      </Button>
    </div>
  );
}
