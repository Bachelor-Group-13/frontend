import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { api } from "@/lib/api/auth";
import { subscribeToPush } from "@/lib/utils/push";

/**
 * Props for the NotificationToggle component.
 * @param user - The current user data, used to manage notification subscriptions
 * @param className - Optional class name for styling
 */
interface NotificationToggleProps {
  user: { id: string } | null;
  className?: string;
}

/**
 * A component for managing push notification subscriptions.
 *
 * Allows users to toggle notifications on/off
 * @param {NotificationToggleProps} props - The props for the NotificationToggle component
 */
export function NotificationToggle({
  user,
  className,
}: NotificationToggleProps) {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    navigator.serviceWorker
      .getRegistration()
      .then((reg) =>
        reg?.pushManager.getSubscription().then((sub) => setSubscribed(!!sub))
      );
  }, []);

  const toggle = async () => {
    if (!user?.id) return alert("Log in first to enable notifications");

    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();

    if (existing) {
      await existing.unsubscribe();
      setSubscribed(false);
      await api.post("/api/push/unsubscribe", { endpoint: existing.endpoint });
    } else {
      await subscribeToPush(user.id);
      setSubscribed(true);
    }
  };

  return (
    <Button
      onClick={toggle}
      variant="ghost"
      size="sm"
      className={cn("flex gap-2", "px-0 py-0", className)}
    >
      {/* Toggle button with icon and text */}
      {subscribed ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
      <span className="text-sm">
        {subscribed ? "Notifications On" : "Notifications Off"}
      </span>
      <div />
    </Button>
  );
}
