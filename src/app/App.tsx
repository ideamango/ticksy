import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { AppLayout } from "./components/app-layout";
import { AuthProvider } from "./context/auth-context";
import { ListsProvider } from "./context/list-context";
import { ThemeProvider } from "next-themes";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppLayout>
        <AuthProvider>
          <ListsProvider>
            <RouterProvider router={router} />
            <Toaster />
          </ListsProvider>
        </AuthProvider>
      </AppLayout>
    </ThemeProvider>
  );
}