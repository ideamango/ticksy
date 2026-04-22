import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { CloudOff } from "lucide-react";

export function PwaPrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error)
    },
  });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOffline) {
      toast.error("You are offline", {
        description: "App is running in offline mode. Changes will sync when reconnected.",
        icon: <CloudOff className="h-4 w-4" />,
        duration: Infinity,
        id: "offline-toast"
      });
    } else {
      toast.dismiss("offline-toast");
    }
  }, [isOffline]);

  useEffect(() => {
    if (needRefresh) {
      toast("Update Available", {
        description: "A new version of Ticksy is available.",
        action: {
          label: "Reload",
          onClick: () => updateServiceWorker(true),
        },
        duration: Infinity,
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}
