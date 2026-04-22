import { useEffect, useState } from "react";
import { Download, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

interface InstallPwaButtonProps {
  variant?: 'sidebar' | 'default' | 'profile';
}

export function InstallPwaButton({ variant = 'default' }: InstallPwaButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (!isInstallable) return null;

  if (variant === 'sidebar') {
    return (
      <button 
        onClick={handleInstallClick} 
        title="Install App"
        className="p-3 text-primary hover:bg-primary/10 rounded-xl transition-all"
      >
        <Download className="w-5 h-5" />
      </button>
    );
  }

  if (variant === 'profile') {
    return (
      <div className="flex items-center justify-between group cursor-pointer" onClick={handleInstallClick}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-muted rounded-2xl text-muted-foreground group-hover:bg-highlight/10 group-hover:text-highlight transition-colors">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-foreground text-base md:text-lg">Install Mobile App</p>
            <p className="text-sm text-muted-foreground font-medium">Add Ticksy to your home screen</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    );
  }

  return (
    <div className="px-4 py-2 mt-auto">
      <Button 
        variant="default" 
        className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={handleInstallClick}
      >
        <Download className="h-4 w-4" />
        Install App
      </Button>
    </div>
  );
}
