import { useState, useEffect } from "react";
import { subscribeToPush } from "@/lib/utils/push";
import { Button } from "../ui/button";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils/utils";

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

  // Check if user is already subscribed to notifications
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.id) return;
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        setSubscribed(!!subscription);
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };
    checkSubscription();
  }, [user?.id]);

  // Handle subscription toggle
  const handleSubscribeClick = async () => {
    if (!user?.id) {
      alert("You need to be logged in to enable notifications");
      return;
    }
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const existingSubscription =
        await registration?.pushManager.getSubscription();

      if (existingSubscription) {
        await existingSubscription.unsubscribe();
        setSubscribed(false);
      } else {
        await subscribeToPush(user.id);
        setSubscribed(true);
      }
    } catch (error) {
      console.error("Error managing push notifications:", error);
      alert("Failed to manage notification settings");
    }
  };

  return (
    <Button
      onClick={handleSubscribeClick}
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
