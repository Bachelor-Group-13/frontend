import { useState, useEffect } from "react";
import { subscribeToPush } from "@/lib/utils/push";
import { Button } from "../ui/button";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface NotificationToggleProps {
  user: { id: string } | null;
  className?: string;
}

export function NotificationToggle({
  user,
  className,
}: NotificationToggleProps) {
  const [subscribed, setSubscribed] = useState(false);

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
      {subscribed ? (
        <Bell className="h-4 w-4 text-white" />
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
