import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { RequireAuth } from "@/layouts/RequireAuth";
import { AccountPage } from "@/pages/app/AccountPage";
import { AppIndexRedirect } from "@/pages/app/AppIndexRedirect";
import { DashboardPage } from "@/pages/app/DashboardPage";
import { NotesPage } from "@/pages/app/NotesPage";
import { TenantSettingsPage } from "@/pages/app/TenantSettingsPage";
import { AcceptInvitePage } from "@/pages/public/AcceptInvitePage";
import { ForgotPasswordPage } from "@/pages/public/ForgotPasswordPage";
import { LandingPage } from "@/pages/public/LandingPage";
import { LoginPage } from "@/pages/public/LoginPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { RegisterPage } from "@/pages/public/RegisterPage";
import { ResetPasswordPage } from "@/pages/public/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/public/VerifyEmailPage";

export function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/invite/:token" element={<AcceptInvitePage />} />

      {/* Área logada */}
      <Route path="/app" element={<RequireAuth />}>
        <Route index element={<AppIndexRedirect />} />
        <Route path=":tenantSlug" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="settings" element={<TenantSettingsPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
