import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { RequireAuth } from "@/layouts/RequireAuth";
import { ForgotPasswordPage } from "@/domains/auth/pages/ForgotPasswordPage";
import { LoginPage } from "@/domains/auth/pages/LoginPage";
import { RegisterPage } from "@/domains/auth/pages/RegisterPage";
import { ResetPasswordPage } from "@/domains/auth/pages/ResetPasswordPage";
import { VerifyEmailPage } from "@/domains/auth/pages/VerifyEmailPage";
import { AccountPage } from "@/domains/account/pages/AccountPage";
import { NotesPage } from "@/domains/note/pages/NotesPage";
import { AcceptInvitePage } from "@/domains/tenant/pages/AcceptInvitePage";
import { AppIndexRedirect } from "@/domains/tenant/pages/AppIndexRedirect";
import { DashboardPage } from "@/domains/tenant/pages/DashboardPage";
import { TenantSettingsPage } from "@/domains/tenant/pages/TenantSettingsPage";
import { LandingPage } from "@/domains/marketing/pages/LandingPage";
import { NotFoundPage } from "@/app/NotFoundPage";

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

      {/* Authenticated area */}
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
