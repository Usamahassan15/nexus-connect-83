import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Share2, Check, Facebook, Twitter, Linkedin, Mail, MessageCircle, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
}

const ShareProfileModal = ({ isOpen, onClose, url, title }: ShareProfileModalProps) => {
  const [copied, setCopied] = useState(false);
  const profileUrl = url || `${window.location.origin}/profile`;
  const shareTitle = title || "Check out my profile";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareTitle,
          url: profileUrl,
        });
        onClose();
      } catch (err) {
        // User cancelled or error
        console.log("Share cancelled");
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({ title: "Link copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  const socialLinks = [
    { name: "WhatsApp", icon: MessageCircle, url: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${profileUrl}`)}` },
    { name: "Facebook", icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}` },
    { name: "Twitter", icon: Twitter, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=Check out my profile!` },
    { name: "LinkedIn", icon: Linkedin, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}` },
    { name: "Instagram", icon: Instagram, url: `https://www.instagram.com/` },
    { name: "Email", icon: Mail, url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(profileUrl)}` },
  ];

  // Try native share on mobile
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Share Profile</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {canNativeShare && (
                <Button
                  className="w-full mb-4 gap-2 bg-gradient-to-r from-primary to-primary/80"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                  Share via...
                </Button>
              )}

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={profileUrl}
                    readOnly
                    className="flex-1 bg-muted"
                  />
                  <Button variant="outline" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-3">Or share on:</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {socialLinks.map((social) => (
                      <Button
                        key={social.name}
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full"
                        onClick={() => window.open(social.url, "_blank")}
                      >
                        <social.icon className="w-5 h-5" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareProfileModal;
