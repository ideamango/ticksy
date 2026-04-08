import { motion } from "motion/react";
import { X, Link as LinkIcon, Copy, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  listName: string;
  shareLink: string;
}

export function ShareModal({ isOpen, onClose, listName, shareLink }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shortLink, setShortLink] = useState<string | null>(null);
  const [isShortening, setIsShortening] = useState(false);

  const effectiveShareLink = shortLink ?? shareLink;

  useEffect(() => {
    if (!isOpen || !shareLink) return;

    const controller = new AbortController();

    const shortenLink = async () => {
      setIsShortening(true);
      setShortLink(null);

      try {
        const response = await fetch(
          `https://tinyurl.com/api-create.php?url=${encodeURIComponent(shareLink)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("TinyURL request failed");
        }

        const tinyUrl = (await response.text()).trim();
        if (tinyUrl.startsWith("http://") || tinyUrl.startsWith("https://")) {
          setShortLink(tinyUrl);
        }
      } catch {
        // Fall back to the original link when shortening is unavailable.
      } finally {
        if (!controller.signal.aborted) {
          setIsShortening(false);
        }
      }
    };

    void shortenLink();

    return () => {
      controller.abort();
    };
  }, [isOpen, shareLink]);

  const compactLinkLabel = useMemo(() => {
    if (isShortening && !shortLink) return "Creating short link...";
    return effectiveShareLink;
  }, [effectiveShareLink, isShortening, shortLink]);

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
    `Here's our shared list: ${listName}\n${effectiveShareLink}`,
  )}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(effectiveShareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="mb-1">Share "{listName}"</h3>
            <p className="text-sm text-muted-foreground">
              Anyone with the link can view and edit
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-[var(--modal-item-bg)] border border-border rounded-xl">
            <LinkIcon className="w-8 h-8 text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1">Share link</p>
            <p className="text-xs text-foreground/60 truncate">{compactLinkLabel}</p>
          </div>
        </div>

        <div className="bg-[var(--modal-item-bg)] border border-border rounded-xl p-4 mb-4 overflow-hidden">
          <div className="overflow-x-auto">
            <p className="text-sm text-foreground font-mono whitespace-nowrap min-w-max">
              {effectiveShareLink}
            </p>
          </div>
        </div>

        <motion.button
          onClick={handleCopy}
          className={`
            w-full py-4 px-4 font-bold transition-all shadow-md mt-4 flex items-center justify-center gap-2
            ${copied ? "bg-highlight text-highlight-foreground" : "bg-card border border-border text-foreground hover:bg-muted/40"}
          `}
          style={{ 
            borderRadius: "var(--btn-border-radius)",
            border: copied ? "none" : "1px solid var(--cancel-btn-border)"
          }}
          whileTap={{ scale: 0.98 }}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copy Link
            </>
          )}
        </motion.button>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block w-full py-4 px-4 font-bold text-center bg-highlight text-highlight-foreground shadow-md"
          style={{ borderRadius: "var(--btn-border-radius)" }}
        >
          Share on WhatsApp
        </a>
      </motion.div>
    </motion.div>
  );
}
