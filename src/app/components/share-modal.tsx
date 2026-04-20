import { motion } from "motion/react";
import { X, Link as LinkIcon, Copy, Check } from "lucide-react";
import { useState } from "react";
import { APP_CONSTANTS } from "../constants";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  listName: string;
  shareLink: string;
}

export function ShareModal({ isOpen, onClose, listName, shareLink }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareMessageText = APP_CONSTANTS.SHARE_MESSAGE_TEMPLATE
    .replace("{listName}", listName)
    .replace("{url}", shareLink);

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(shareMessageText)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareMessageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
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
          <div className="p-4 bg-secondary/10 rounded-2xl">
            <LinkIcon className="w-8 h-8 text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1">Share link</p>
            <p className="text-xs text-foreground/60 truncate">{shareLink}</p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-2xl p-4 mb-4 overflow-hidden">
          <div className="overflow-x-auto">
            <p className="text-sm text-foreground font-mono whitespace-nowrap min-w-max">
              {shareLink}
            </p>
          </div>
        </div>

        <motion.button
          onClick={handleCopy}
          className={`
            w-full py-3 px-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2
            ${copied ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}
          `}
          whileTap={{ scale: 0.98 }}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Copied Message!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copy Message & Link
            </>
          )}
        </motion.button>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block w-full py-3 px-4 rounded-2xl font-semibold text-center bg-primary text-primary-foreground"
        >
          Share on WhatsApp
        </a>
      </motion.div>
    </motion.div>
  );
}
