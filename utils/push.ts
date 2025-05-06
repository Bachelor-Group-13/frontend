import { api } from "./auth";

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const b64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export async function subscribeToPush(userId: string) {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      throw new Error("Push messaging is not supported");
    }

    const registration = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      throw new Error("Notification permission denied");
    }

    const keyResponse = await api.get("/api/push/publicKey");
    const publicKey = keyResponse.data;
    console.log("Public Key received:", publicKey);

    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    });
    console.log("Subscription object:", subscription);

    const rawKey = subscription.getKey("p256dh");
    const rawAuthSecret = subscription.getKey("auth");

    if (!rawKey || !rawAuthSecret) {
      throw new Error("Failed to get subscription keys");
    }

    const subscriptionData = {
      endpoint: subscription.endpoint,
      p256dh: btoa(
        String.fromCharCode.apply(null, [...new Uint8Array(rawKey)])
      ),
      auth: btoa(
        String.fromCharCode.apply(null, [...new Uint8Array(rawAuthSecret)])
      ),
      userId: userId,
    };

    const result = await api.post("/api/push/subscribe", subscriptionData);
    console.log("Subscription response:", result.status);

    if (result.status !== 200) {
      throw new Error("Failed to subscribe to push notifications");
    }

    return subscription;
  } catch (error) {
    console.error("Push subscription error:", error);
    throw error;
  }
}
