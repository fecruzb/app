import { Navigate, Route, useLocation, useParams } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import {
  ProductAccountPage,
  ProductAdminPage,
  ProductAgentPage,
  ProductAuthPage,
  ProductBillingPage,
  ProductTenantsPage,
  ProductWorkspacePage,
} from "./pages/ProductAreaPage";
import { ProductPage } from "./pages/ProductPage";
import {
  PlatformsAndroidPage,
  PlatformsIosPage,
  PlatformsLinuxPage,
  PlatformsMacosPage,
  PlatformsWindowsPage,
} from "./pages/PlatformAreaPage";
import { PlatformsPage } from "./pages/PlatformsPage";
import { PublicArticlePage } from "./pages/PublicArticlePage";
import { PublicArticlesPage } from "./pages/PublicArticlesPage";
import { StructureApiPage } from "./pages/StructureApiPage";
import { StructureDatabasePage } from "./pages/StructureDatabasePage";
import { StructureEnvironmentPage } from "./pages/StructureEnvironmentPage";
import { StructureI18nPage } from "./pages/StructureI18nPage";
import { StructurePage } from "./pages/StructurePage";
import { StructureStoragePage } from "./pages/StructureStoragePage";
import { StructureWebPage } from "./pages/StructureWebPage";
import {
  UiBrandPage,
  UiCategoryRoute,
  UiChartsPage,
  UiControlsPage,
  UiDataPage,
  UiFormsPage,
  UiOverlaysPage,
  UiShellsPage,
  UiThemingPage,
} from "./pages/UiCategoryPage";
import { UiPage } from "./pages/UiPage";

/** Map legacy /structure/* URLs onto /code/*. */
function StructureToCodeRedirect() {
  const { pathname, search } = useLocation();
  const suffix = pathname.replace(/^\/structure/, "") || "";
  return <Navigate to={`/code${suffix}${search}`} replace />;
}

/** Legacy /code/ui → /ui (and /code/ui/theming → /ui/theming when present). */
function CodeUiRedirect() {
  const { pathname, search } = useLocation();
  const suffix = pathname.replace(/^\/code\/ui/, "") || "";
  return <Navigate to={`/ui${suffix}${search}`} replace />;
}

function UiCategoryParamRoute() {
  const { category = "" } = useParams();
  return <UiCategoryRoute category={category} />;
}

export const marketingRoutes = (
  <>
    <Route path="/" element={<LandingPage />} />

    <Route path="/code" element={<StructurePage />} />
    <Route path="/code/api" element={<StructureApiPage />} />
    <Route path="/code/web" element={<StructureWebPage />} />
    <Route path="/code/ui" element={<CodeUiRedirect />} />
    <Route path="/code/ui/*" element={<CodeUiRedirect />} />
    <Route path="/code/environment" element={<StructureEnvironmentPage />} />
    <Route path="/code/database" element={<StructureDatabasePage />} />
    <Route path="/code/storage" element={<StructureStoragePage />} />
    <Route path="/code/i18n" element={<StructureI18nPage />} />

    <Route path="/product" element={<ProductPage />} />
    <Route path="/product/auth" element={<ProductAuthPage />} />
    <Route path="/product/workspace" element={<ProductWorkspacePage />} />
    <Route path="/product/agent" element={<ProductAgentPage />} />
    <Route path="/product/account" element={<ProductAccountPage />} />
    <Route path="/product/tenants" element={<ProductTenantsPage />} />
    <Route path="/product/billing" element={<ProductBillingPage />} />
    <Route path="/product/admin" element={<ProductAdminPage />} />

    <Route path="/platforms" element={<PlatformsPage />} />
    <Route path="/platforms/windows" element={<PlatformsWindowsPage />} />
    <Route path="/platforms/linux" element={<PlatformsLinuxPage />} />
    <Route path="/platforms/macos" element={<PlatformsMacosPage />} />
    <Route path="/platforms/ios" element={<PlatformsIosPage />} />
    <Route path="/platforms/android" element={<PlatformsAndroidPage />} />

    <Route path="/ui" element={<UiPage />} />
    <Route path="/ui/theming" element={<UiThemingPage />} />
    <Route path="/ui/brand" element={<UiBrandPage />} />
    <Route path="/ui/shells" element={<UiShellsPage />} />
    <Route path="/ui/controls" element={<UiControlsPage />} />
    <Route path="/ui/forms" element={<UiFormsPage />} />
    <Route path="/ui/overlays" element={<UiOverlaysPage />} />
    <Route path="/ui/data" element={<UiDataPage />} />
    <Route path="/ui/charts" element={<UiChartsPage />} />
    <Route path="/ui/:category" element={<UiCategoryParamRoute />} />

    <Route path="/structure" element={<StructureToCodeRedirect />} />
    <Route path="/structure/*" element={<StructureToCodeRedirect />} />
    <Route path="/tour" element={<Navigate to="/product" replace />} />
    <Route path="/foundations" element={<Navigate to="/ui" replace />} />

    <Route path="/articles" element={<PublicArticlesPage />} />
    <Route path="/articles/:articleId" element={<PublicArticlePage />} />
  </>
);
