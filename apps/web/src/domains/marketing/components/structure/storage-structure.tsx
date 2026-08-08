import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { HardDriveIcon } from "lucide-react";
import { points } from "@/i18n";
import { CodeBlock } from "@app/ui/code-block";
import { Explorer } from "@app/ui/explorer";
import { Terminal } from "@app/ui/terminal";
import { MarketingHero } from "../marketing-hero";
import {
  R2ApiTokensMock,
  R2BucketObjectsMock,
  R2BucketSettingsMock,
  R2BucketsMock,
  R2CreateTokenMock,
  RenderEnvMock,
} from "../product-preview";
import { DbGroupSection, type DbGroup } from "./database-foundation";
import { buildStorageRepoTree } from "./explorer-trees";
import {
  mediaBackendsFile,
  mediaStoreFile,
  r2IntegrationFile,
  writeMediaFile,
} from "./resource-snippets";

type CourseKey =
  | "overview"
  | "contract"
  | "backends"
  | "write"
  | "local"
  | "r2Buckets"
  | "r2Objects"
  | "r2Settings"
  | "r2Tokens"
  | "r2CreateToken"
  | "r2Env"
  | "r2Integration";

function courseBlock(key: CourseKey, t: TFunction, visual: ReactNode): DbGroup {
  return {
    id: key,
    eyebrow: t(`landing.storageCourse.${key}.eyebrow`),
    title: t(`landing.storageCourse.${key}.title`),
    body: t(`landing.storageCourse.${key}.body`),
    points: points(t, `landing.storageCourse.${key}.points`),
    visual,
  };
}

function buildCode(t: TFunction): DbGroup[] {
  return [
    courseBlock(
      "overview",
      t,
      <Explorer
        title={t("landing.structureIntro.preview.explorer")}
        workspace={t("landing.storageCourse.overview.workspace")}
        ariaLabel={t("landing.storageCourse.overview.aria")}
        tree={buildStorageRepoTree(t)}
      />,
    ),
    courseBlock(
      "contract",
      t,
      <CodeBlock filename="apps/api/src/lib/media-store.ts" code={mediaStoreFile} />,
    ),
    courseBlock(
      "backends",
      t,
      <CodeBlock filename="domains/article/utils/media.utils.ts" code={mediaBackendsFile} />,
    ),
    courseBlock(
      "write",
      t,
      <CodeBlock filename="writeMedia" code={writeMediaFile} />,
    ),
    courseBlock(
      "local",
      t,
      <Terminal
        label="bash — local media"
        lines={[
          { prompt: true, text: "echo $MEDIA_DIR" },
          { text: t("landing.storageCourse.local.visualDir"), muted: true },
          { prompt: true, text: "ls apps/web/public/uploads 2>/dev/null || echo empty" },
          { text: t("landing.storageCourse.local.visualEmpty"), muted: true },
        ]}
      />,
    ),
  ];
}

function buildR2(t: TFunction): DbGroup[] {
  return [
    courseBlock("r2Buckets", t, <R2BucketsMock />),
    courseBlock("r2Objects", t, <R2BucketObjectsMock />),
    courseBlock("r2Settings", t, <R2BucketSettingsMock />),
    courseBlock("r2Tokens", t, <R2ApiTokensMock />),
    courseBlock("r2CreateToken", t, <R2CreateTokenMock />),
    courseBlock(
      "r2Env",
      t,
      <RenderEnvMock
        keys={[
          "CLOUDFLARE_S3_API",
          "CLOUDFLARE_ACCESS_KEY_ID",
          "CLOUDFLARE_SECRET_ACCESS_KEY",
          "CLOUDFLARE_MEDIA_BUCKET",
          "R2_PUBLIC_BASE_URL",
        ]}
        highlight={[
          "CLOUDFLARE_ACCESS_KEY_ID",
          "CLOUDFLARE_SECRET_ACCESS_KEY",
          "R2_PUBLIC_BASE_URL",
        ]}
        footnote={t("landing.storageCourse.r2Env.visualFootnote")}
      />,
    ),
    courseBlock(
      "r2Integration",
      t,
      <CodeBlock filename="integrations/r2.ts" code={r2IntegrationFile} />,
    ),
  ];
}

/**
 * Storage course: MediaStore → local disk → Cloudflare R2 → env on Render.
 */
export function StorageStructure() {
  const { t, i18n } = useTranslation();
  const code = useMemo(() => buildCode(t), [t, i18n.language]);
  const r2 = useMemo(() => buildR2(t), [t, i18n.language]);

  let flipIndex = 0;

  return (
    <>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <HardDriveIcon className="size-4" />
            {t("landing.structureStorage.eyebrow")}
          </>
        }
        title={t("landing.structureStorage.title")}
        body={t("landing.structureStorage.body")}
      />

      {code.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.storageCourse.parts.r2.eyebrow")}
        title={t("landing.storageCourse.parts.r2.title")}
        body={t("landing.storageCourse.parts.r2.body")}
      />

      {r2.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}
    </>
  );
}
