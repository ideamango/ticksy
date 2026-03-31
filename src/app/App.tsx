import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { AppLayout } from "./components/app-layout";
import { ListsProvider } from "./context/list-context";

export default function App() {
  return (
    <AppLayout>
      <ListsProvider>
        <RouterProvider router={router} />
        <Toaster />
      </ListsProvider>
    </AppLayout>
  );
}