import { createBrowserRouter, Outlet } from "react-router";
import { Dashboard } from "./screens/dashboard";
import { ClassicDashboard } from "./screens/classic-dashboard";
import { ListDetail } from "./screens/list-detail";
import { Templates } from "./screens/templates";
import { Alerts } from "./screens/alerts";
import { Profile } from "./screens/profile";
import { Sidebar } from "./components/sidebar";
import { ThemeToggle } from "./components/theme-toggle";
import { MobileBottomNav } from "./components/mobile-bottom-nav";

function WebLayout() {
  return (
    <div className="flex h-screen bg-muted/10 dark:bg-black font-sans text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex-1 md:ml-16 lg:ml-20 h-full overflow-y-auto relative pb-16 md:pb-0">
        <Outlet />
      </div>
      <MobileBottomNav />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <WebLayout />,
    children: [
      {
        path: "/",
        Component: ClassicDashboard,
      },
      {
        path: "/minimal",
        Component: Dashboard,
      },
      {
        path: "/lists",
        Component: ListDetail,
      },
      {
        path: "/list/:id",
        Component: ListDetail,
      },
      {
        path: "/templates",
        Component: Templates,
      },
      {
        path: "/alerts",
        Component: Alerts,
      },
      {
        path: "/profile",
        Component: Profile,
      },
    ]
  }
]);
