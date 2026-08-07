import { Route } from "react-router-dom";
import { FoundationsPage } from "./pages/FoundationsPage";
import { LandingPage } from "./pages/LandingPage";
import { PublicArticlePage } from "./pages/PublicArticlePage";
import { PublicArticlesPage } from "./pages/PublicArticlesPage";
import { TourPage } from "./pages/TourPage";
import { UiPage } from "./pages/UiPage";

export const marketingRoutes = (
  <>
    <Route path="/" element={<LandingPage />} />
    <Route path="/foundations" element={<FoundationsPage />} />
    <Route path="/tour" element={<TourPage />} />
    <Route path="/ui" element={<UiPage />} />
    <Route path="/articles" element={<PublicArticlesPage />} />
    <Route path="/articles/:articleId" element={<PublicArticlePage />} />
  </>
);
