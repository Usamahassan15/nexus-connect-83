import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const initialStories = [
  { id: 1, name: "Your Story", image: null as string | null, isAdd: true },
  { id: 2, name: "Sarah", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", media: "https://picsum.photos/seed/story-sarah/720/1280" },
  { id: 3, name: "Mike", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", media: "https://picsum.photos/seed/story-mike/720/1280" },
  { id: 4, name: "Emma", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", media: "https://picsum.photos/seed/story-emma/720/1280" },
  { id: 5, name: "Jake", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jake", media: "https://picsum.photos/seed/story-jake/720/1280" },
  { id: 6, name: "Olivia", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia", media: "https://picsum.photos/seed/story-olivia/720/1280" },
];

const STORY_DURATION = 5000;

const Stories = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stories, setStories] = useState(initialStories);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIsVideo, setPreviewIsVideo] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  const handleYourStoryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewIsVideo(file.type.startsWith("video/"));
      setPreviewUrl(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleShareStory = () => {
    if (!previewUrl) return;
    setStories((prev) =>
      prev.map((s) => (s.isAdd ? { ...s, image: previewIsVideo ? s.image : previewUrl, media: previewUrl } : s))
    );
    setPreviewUrl(null);
    toast({ title: "Story shared", description: "Your story is now live for 24 hours." });
  };

  // Stories that can be viewed (have media)
  const viewable = stories.filter((s) => (s as any).media);

  const openViewer = (storyId: number) => {
    const idx = viewable.findIndex((s) => s.id === storyId);
    if (idx === -1) return;
    setViewerIndex(idx);
    setProgress(0);
  };

  const closeViewer = useCallback(() => {
    setViewerIndex(null);
    setProgress(0);
  }, []);

  const goNext = useCallback(() => {
    setViewerIndex((i) => {
      if (i === null) return null;
      if (i + 1 >= viewable.length) return null;
      return i + 1;
    });
    setProgress(0);
  }, [viewable.length]);

  const goPrev = useCallback(() => {
    setViewerIndex((i) => (i === null ? null : Math.max(0, i - 1)));
    setProgress(0);
  }, []);

  // Auto-advance progress (Instagram style)
  useEffect(() => {
    if (viewerIndex === null) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / STORY_DURATION) * 100);
      setProgress(pct);
      if (pct >= 100) goNext();
    }, 50);
    return () => clearInterval(timer);
  }, [viewerIndex, goNext]);

  useEffect(() => {
    if (viewerIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerIndex, closeViewer, goNext, goPrev]);

  const storiesContainerRef = useRef<HTMLDivElement>(null);

  // Mark touch events originating from stories to prevent page navigation
  useEffect(() => {
    const el = storiesContainerRef.current;
    if (!el) return;

    const markEvent = (e: TouchEvent) => {
      (e as any).__storySwipe = true;
    };

    el.addEventListener('touchstart', markEvent, { passive: true });
    el.addEventListener('touchend', markEvent, { passive: true });
    el.addEventListener('touchmove', markEvent, { passive: true });

    return () => {
      el.removeEventListener('touchstart', markEvent);
      el.removeEventListener('touchend', markEvent);
      el.removeEventListener('touchmove', markEvent);
    };
  }, []);

  const active = viewerIndex !== null ? (viewable[viewerIndex] as any) : null;

  return (
    <div
      ref={storiesContainerRef}
      className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide"
    >
      {/* Hidden file input for Your Story */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {stories.map((story, index) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 cursor-pointer"
          onClick={
            story.isAdd && !(story as any).media
              ? handleYourStoryClick
              : () => openViewer(story.id)
          }
        >
          <div className="relative">
            {story.isAdd && !story.image ? (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center glow-effect">
                <Plus className="w-8 h-8 text-primary-foreground" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-primary to-primary-glow glow-effect">
                <Avatar className="w-full h-full border-4 border-background">
                  <AvatarImage src={story.image || undefined} className="object-cover" />
                  <AvatarFallback>{story.name[0]}</AvatarFallback>
                </Avatar>
              </div>
            )}
            {story.isAdd && story.image && (
              <button
                onClick={(e) => { e.stopPropagation(); handleYourStoryClick(); }}
                aria-label="Add to your story"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background"
              >
                <Plus className="w-3.5 h-3.5 text-primary-foreground" />
              </button>
            )}
          </div>
          <p className="text-xs text-center mt-2 text-foreground font-medium truncate w-20">
            {story.name}
          </p>
        </motion.div>
      ))}

      {/* Story upload preview */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share to your story</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="rounded-xl overflow-hidden bg-muted max-h-[55vh] flex items-center justify-center">
              {previewIsVideo ? (
                <video src={previewUrl} controls className="w-full max-h-[55vh]" />
              ) : (
                <img src={previewUrl} alt="Story preview" className="w-full max-h-[55vh] object-contain" />
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-11" onClick={closePreview}>
              Discard
            </Button>
            <Button className="flex-1 h-11" onClick={handleShareStory}>
              Share Story
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Instagram-style fullscreen story viewer */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-black flex items-center justify-center"
          >
            <div className="relative w-full h-full sm:h-[92vh] sm:w-[420px] sm:rounded-2xl overflow-hidden bg-black">
              {/* Progress bars */}
              <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
                {viewable.map((s, i) => (
                  <div key={s.id} className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden">
                    <div
                      className="h-full bg-white"
                      style={{ width: i < (viewerIndex ?? 0) ? "100%" : i === viewerIndex ? `${progress}%` : "0%" }}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-5 left-3 right-3 z-20 flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); closeViewer(); navigate(active.isAdd ? "/profile" : `/user/${active.id}`); }}
                  aria-label={`Open ${active.name} profile`}
                  className="flex items-center gap-2"
                >
                  <Avatar className="w-9 h-9 ring-2 ring-white/80">
                    <AvatarImage src={active.image || undefined} />
                    <AvatarFallback>{active.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold text-white drop-shadow">{active.name}</span>
                </button>
                <button
                  onClick={closeViewer}
                  aria-label="Close story"
                  className="ml-auto h-9 w-9 rounded-full bg-white/15 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Media */}
              <img
                src={active.media}
                alt={`${active.name} story`}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Tap zones */}
              <button
                onClick={goPrev}
                aria-label="Previous story"
                className="absolute left-0 top-0 h-full w-1/3 z-10"
              />
              <button
                onClick={goNext}
                aria-label="Next story"
                className="absolute right-0 top-0 h-full w-2/3 z-10"
              />

              {/* Desktop arrows */}
              <button
                onClick={goPrev}
                aria-label="Previous"
                className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/15 items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={goNext}
                aria-label="Next"
                className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/15 items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Stories;
