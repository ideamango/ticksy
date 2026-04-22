import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { AppLayout } from "./components/app-layout";
import { AuthProvider } from "./context/auth-context";
import { ListsProvider } from "./context/list-context";
import { ThemeProvider } from "next-themes";
import { PwaPrompt } from "./components/pwa-prompt";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppLayout>
        <AuthProvider>
          <ListsProvider>
            <RouterProvider router={router} />
            <Toaster />
            <PwaPrompt />
          </ListsProvider>
        </AuthProvider>
      </AppLayout>
    </ThemeProvider>
  );
}