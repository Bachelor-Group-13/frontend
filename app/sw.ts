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

/**
 * Handles incoming push notifications.
 * Processes the notification payload and displays it to the user.
 *
 * @param {PushEvent} event - The push event containing notification data
 */
self.addEventListener("push", (event) => {
  console.log("Push event received", event);

  if (!event?.data) {
    console.log("No data received in push event");
    return;
  }

  const payload = (() => {
    try {
      const jsonData = event.data.json();
      console.log("Processing push notification with data:", jsonData);
      return jsonData;
    } catch (e) {
      console.error("Error parsing JSON:", e);
      try {
        const textData = event.data.text();
        console.log("Falling back to text data:", textData);
        return {
          title: "Parking Alert",
          body: textData || "No additional information",
        };
      } catch (e) {
        console.error("Error getting text data:", e);
        return {
          title: "Parking Alert",
          body: "You have a new notification!",
        };
      }
    }
  })();

  const notificationOptions = {
    body: payload.body || "New notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    requireInteraction: true,
    silent: false,
    tag: "parking-alert",
    timestamp: Date.now(),
    actions: [
      {
        action: "open",
        title: "Open App",
      },
    ],
  };

  console.log("Showing notification with options:", notificationOptions);

  event.waitUntil(
    self.registration
      .showNotification(payload.title || "Parking Alert", notificationOptions)
      .then(() => console.log("Notification shown successfully"))
      .catch((error) => console.error("Error showing notification:", error))
  );
});
