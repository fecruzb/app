import { Navigate, Route } from "react-router-dom";
import { FoundationsPage } from "./pages/FoundationsPage";
import { LandingPage } from "./pages/LandingPage";
import { PublicArticlePage } from "./pages/PublicArticlePage";
import { PublicArticlesPage } from "./pages/PublicArticlesPage";
import { StructureApiPage } from "./pages/StructureApiPage";
import { StructureDatabasePage } from "./pages/StructureDatabasePage";
import { StructureEnvironmentPage } from "./pages/StructureEnvironmentPage";
import { StructureI18nPage } from "./pages/StructureI18nPage";
import { StructurePage } from "./pages/StructurePage";
import { StructureStoragePage } from "./pages/StructureStoragePage";
import { StructureUiPage } from "./pages/StructureUiPage";
import { StructureWebPage } from "./pages/StructureWebPage";
import { TourPage } from "./pages/TourPage";

export const marketingRoutes = (
  <>
    <Route path="/" element={<LandingPage />} />
    <Route path="/structure" element={<StructurePage />} />
    <Route path="/structure/api" element={<StructureApiPage />} />
    <Route path="/structure/web" element={<StructureWebPage />} />
    <Route path="/structure/ui" element={<StructureUiPage />} />
    <Route path="/structure/environment" element={<StructureEnvironmentPage />} />
    <Route path="/structure/database" element={<StructureDatabasePage />} />
    <Route path="/structure/storage" element={<StructureStoragePage />} />
    <Route path="/structure/i18n" element={<StructureI18nPage />} />
    <Route path="/foundations" element={<FoundationsPage />} />
    <Route path="/tour" element={<TourPage />} />
    <Route path="/ui" element={<Navigate to="/structure/ui" replace />} />
    <Route path="/articles" element={<PublicArticlesPage />} />
    <Route path="/articles/:articleId" element={<PublicArticlePage />} />
  </>
);
