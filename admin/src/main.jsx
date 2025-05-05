import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter future={{
    v7_startTransition: true, // For React.startTransition in v7
    v7_relativeSplatPath: true, // For relative splat path in v7
  }}>
    <App />
  </BrowserRouter>
);
