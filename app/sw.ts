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

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload: { title: string; body: string };
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Parking Alert", body: event.data.text() || "" };
  }

  const options = {
    body: payload.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});
