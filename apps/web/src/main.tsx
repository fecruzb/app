import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "@/i18n";
import { App } from "@/app/App";
import { ConfirmProvider } from "@app/ui/confirm-dialog";
import { AuthProvider } from "@/domains/auth/auth-provider";
import { ThemeProvider, useTheme } from "@/theme/theme-provider";
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ConfirmProvider>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </ConfirmProvider>
      </QueryClientProvider>
      <ThemedToaster />
    </ThemeProvider>
  </StrictMode>,
);
