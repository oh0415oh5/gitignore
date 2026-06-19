import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthKitProvider } from "@workos-inc/authkit-react";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthKitProvider clientId={import.meta.env.VITE_WORKOS_CLIENT_ID}>
      <ConvexClientProvider>
        <App />
      </ConvexClientProvider>
    </AuthKitProvider>
  </StrictMode>,
);
