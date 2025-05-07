import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { subscribeToPush } from "@/lib/utils/push";

interface NotificationToggleProps {
  user: any;
}

export function NotificationToggle({ user }: NotificationToggleProps) {
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
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Push Notifications</span>
        <Switch
          onCheckedChange={handleSubscribeClick}
          checked={subscribed}
          aria-label="Toggle notifications"
        />
        <span className="text-xs text-gray-500">
          {subscribed ? "On" : "Off"}
        </span>
      </div>
    </div>
  );
}
