import { createBrowserRouter } from "react-router";
import { Dashboard } from "./screens/dashboard";
import { ListDetail } from "./screens/list-detail";
import { Templates } from "./screens/templates";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/list/:id",
    Component: ListDetail,
  },
  {
    path: "/templates",
    Component: Templates,
  },
]);
