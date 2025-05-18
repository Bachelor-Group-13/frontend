import { api } from "../api/auth";

/**
 * Converts a base64 URL string to a Uint8Array.
 * Used for converting the VAPID public key to the format required by the Push API.
 *
 * @param {string} base64String - The base64 URL string to convert
 * @returns The converted array
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const b64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function toBase64Url(uint8Array: Uint8Array): string {
  const base64 = btoa(
    String.fromCharCode.apply(null, [...new Uint8Array(uint8Array)])
  );
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Subscribes a user to push notifications.
 * Handles the entire subscription process
 *
 * @param {string} userId - The ID of the user to subscribe
 * @returns The created push subscription
 * @throws {Error} If push messaging is not supported or permission is denied
 */
export async function subscribeToPush(userId: string) {
  console.log(
    "Attempting to subscribe to push notifications for user:",
    userId
  );
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.error("Push messaging is not supported");
      throw new Error("Push messaging is not supported");
    }
    console.log("Push messaging is supported.");

    console.log("Waiting for service worker registration.");
    const registration = await navigator.serviceWorker.ready;
    console.log("Service worker registered:", registration);

    console.log("Requesting notification permission.");
    const permission = await Notification.requestPermission();
    console.log("Notification permission status:", permission);

    if (permission !== "granted") {
      console.error("Notification permission denied");
      throw new Error("Notification permission denied");
    }
    console.log("Notification permission granted.");

    console.log("Fetching VAPID public key from backend.");
    const keyResponse = await api.get("/api/push/publicKey");
    const publicKey = keyResponse.data;
    console.log("Public Key received:", publicKey);

    console.log("Converting public key to Uint8Array.");
    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    console.log("Converted applicationServerKey:", applicationServerKey);

    console.log("Subscribing with pushManager.subscribe.");
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    });
    console.log("Subscription object:", subscription);

    console.log("Getting p256dh and auth keys from subscription.");
    const rawKey = subscription.getKey("p256dh");
    const rawAuthSecret = subscription.getKey("auth");
    console.log("Raw p256dh key:", rawKey);
    console.log("Raw auth secret:", rawAuthSecret);

    if (!rawKey || !rawAuthSecret) {
      console.error("Failed to get subscription keys");
      throw new Error("Failed to get subscription keys");
    }
    console.log("Successfully obtained subscription keys.");

    const subscriptionData = {
      endpoint: subscription.endpoint,
      p256dh: toBase64Url(new Uint8Array(rawKey)),
      auth: toBase64Url(new Uint8Array(rawAuthSecret)),
      userId: userId,
    };
    console.log("Constructed subscription data for backend:", subscriptionData);

    console.log("Sending subscription data to backend via api.post.");
    const result = await api.post("/api/push/subscribe", subscriptionData);
    console.log("api.post call completed. Result status:", result.status);

    if (result.status !== 200) {
      console.error(
        "Failed to subscribe to push notifications. Backend response status:",
        result.status
      );
      throw new Error("Failed to subscribe to push notifications");
    }
    console.log("Push subscription successful.");

    return subscription;
  } catch (error) {
    console.error("Push subscription error caught:", error);
    throw error;
  }
}
