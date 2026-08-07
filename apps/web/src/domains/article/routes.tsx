import { Fragment } from "react";
import { Route } from "react-router-dom";
import { ArticlePage } from "./pages/ArticlePage";
import { ArticlesPage } from "./pages/ArticlesPage";

export const articleRoutes = (
  <Fragment>
    <Route path="articles" element={<ArticlesPage />} />
    <Route path="articles/:articleId" element={<ArticlePage />} />
  </Fragment>
);
