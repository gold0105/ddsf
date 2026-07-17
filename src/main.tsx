import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { SettingsProvider } from "./contexts/SettingsContext";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <SettingsProvider>
    <App />
  </SettingsProvider>
);
