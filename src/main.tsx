import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/shell.css";
import "./styles/campus.css";
import "./styles/kinetic.css";

// Vercel Web Analytics (cookieless) only when a build turns it on; lib/analytics.ts sends events to it.
if (import.meta.env.VITE_VERCEL_ANALYTICS === "1") {
  const w = window as Window & { va?: (...args: unknown[]) => void; vaq?: unknown[][] };
  w.va ||= (...args) => (w.vaq ||= []).push(args);
  const script = Object.assign(document.createElement("script"), { src: "/_vercel/insights/script.js", defer: true });
  document.head.append(script);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
