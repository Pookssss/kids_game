"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const registerServiceWorker = () => {
      navigator.serviceWorker.register("/service-worker.js").catch((error) => {
        console.log("SW error:", error);
      });
    };

    if (document.readyState === "complete") {
      registerServiceWorker();
      return;
    }

    window.addEventListener("load", registerServiceWorker, { once: true });
    return () => {
      window.removeEventListener("load", registerServiceWorker);
    };
  }, []);

  return null;
}
