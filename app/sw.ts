import { defaultCache } from "@serwist/next/worker";
import { PrecacheEntry, Serwist, SerwistGlobalConfig } from "serwist";

/**
 * Extends the global worker scope with Serwist configuration.
 * Adds type definition for the service worker manifest.
 */
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Initializes the Serwist service worker with caching and navigation preload.
 * Configures precaching, client claiming, and runtime caching strategies.
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
console.log('[SW] 🎉 sw.js loaded (module)')


self.addEventListener("push", (event) => {
  console.log("Push event received", event);

  if (!event.data) {
    console.error("No data in push event");
    return;
  }

  let payload: { title: string; body: string };
  try {
    const data = event.data.text();
    console.log("Raw push data:", data);
    payload = event.data.json();
    console.log("Parsed payload:", payload);
  } catch (error) {
    console.error("Error parsing push data:", error);
    payload = { title: "Parking Alert", body: event.data.text() || "" };
  }

  const options = {
    body: payload.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    requireInteraction: true,
  };

  console.log("Showing notification with options:", options);
  event.waitUntil(
    self.registration
      .showNotification(payload.title, options)
      .then(() => console.log("Notification shown successfully"))
      .catch((err) => console.error("Error showing notification:", err))
  );
});
