import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "@/i18n";
import { App } from "@/app/App";
import { ConfirmProvider } from "@app/ui/confirm-dialog";
import { AuthProvider } from "@/domains/auth/context/auth-provider";
import { ThemeProvider, useTheme } from "@app/ui/theme";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

/** Keeps sonner's toasts in sync with the active light/dark mode. */
function ThemedToaster() {
  const { mode } = useTheme();
  return <Toaster richColors position="top-center" theme={mode} />;
}

/** HashRouter for Tauri custom-protocol; BrowserRouter for the web deploy. */
function AppRouter({ children }: { children: ReactNode }) {
  const useHash = import.meta.env.VITE_ROUTER === "hash";
  const Router = useHash ? HashRouter : BrowserRouter;
  return <Router>{children}</Router>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ConfirmProvider>
          <AuthProvider>
            <AppRouter>
              <App />
            </AppRouter>
          </AuthProvider>
        </ConfirmProvider>
      </QueryClientProvider>
      <ThemedToaster />
    </ThemeProvider>
  </StrictMode>,
);
