import { createBrowserRouter } from "react-router-dom";
import Index from "./views";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
]);

export { router }