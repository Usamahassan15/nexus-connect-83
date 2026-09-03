import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Send, Bookmark, X, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import InstaPost from "@/components/InstaPost";

const CATEGORIES = [
  { name: "Technology", emoji: "💻" },
  { name: "Design", emoji: "🎨" },
  { name: "AI", emoji: "🤖" },
  { name: "Startup", emoji: "🚀" },
  { name: "Business", emoji: "💼" },
  { name: "Science", emoji: "🔬" },
  { name: "Art", emoji: "🖼️" },
  { name: "Sports", emoji: "⚽" },
  { name: "Music", emoji: "🎵" },
  { name: "Travel", emoji: "✈️" },
];

const AUTHORS = [
  "Sarah Connor", "John Smith", "Emma Watson", "Ali Raza", "Maya Patel",
  "Liam Cole", "Zara Khan", "Noah Reed", "Ivy Chen", "Omar Farooq",
];

const CAPTIONS = [
  "Golden hour never misses ✨",
  "Weekend build session 🚀",
  "New workspace setup 💻",
  "Colors of the city 🎨",
  "Shot this on my morning walk",
  "Behind the scenes of my latest project",
  "Little details matter 🔬",
  "Match day energy ⚽",
  "On repeat all week 🎵",
  "Take me back here ✈️",
];

export interface GalleryItem {
  id: string;
  image: string;
  author: string;
  avatar: string;
  caption: string;
  category: string;
  likes: number;
  comments: number;
}

const ROWS_PER_CHUNK = 15;
const ITEMS_PER_CHUNK = ROWS_PER_CHUNK * 3; // 45

function makeItems(chunk: number): GalleryItem[] {
  return Array.from({ length: ITEMS_PER_CHUNK }, (_, i) => {
    const n = chunk * ITEMS_PER_CHUNK + i;
    const author = AUTHORS[n % AUTHORS.length];
    return {
      id: `g-${n}`,
      image: `https://picsum.photos/seed/explore-${n}/600/600`,
      author,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author)}`,
      caption: CAPTIONS[n % CAPTIONS.length],
      category: CATEGORIES[n % CATEGORIES.length].name,
      likes: 120 + ((n * 37) % 4800),
      comments: 4 + ((n * 13) % 220),
    };
  });
}

interface ExploreGalleryProps {
  selectedCategory?: string | null;
  onCategorySelect?: (category: string | null) => void;
}

const ExploreGallery = ({ selectedCategory = null, onCategorySelect }: ExploreGalleryProps) => {
  const [chunkCount, setChunkCount] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const chunks = useMemo(
    () => Array.from({ length: chunkCount }, (_, c) => makeItems(c)),
    [chunkCount]
  );

  const allItems = useMemo(() => chunks.flat(), [chunks]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setChunkCount((c) => (c < 12 ? c + 1 : c));
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const openViewer = useCallback((item: GalleryItem) => {
    setViewerIndex(allItems.findIndex((i) => i.id === item.id));
  }, [allItems]);

  return (
    <div className="space-y-3">
      {chunks.map((items, chunkIdx) => (
        <div key={chunkIdx} className="space-y-3">
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => openViewer(item)}
                className="relative aspect-square overflow-hidden bg-muted group"
                aria-label={`Open post by ${item.author}`}
              >
                <img
                  src={item.image}
                  alt={item.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                  <span className="flex items-center gap-1 text-primary-foreground text-xs font-semibold">
                    <Heart className="w-4 h-4 fill-current" /> {item.likes}
                  </span>
                  <span className="flex items-center gap-1 text-primary-foreground text-xs font-semibold">
                    <MessageCircle className="w-4 h-4 fill-current" /> {item.comments}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Categories strip after every 15 rows */}
          <div className="py-2">
            <h3 className="text-sm font-bold text-foreground mb-2">Categories</h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() =>
                    onCategorySelect?.(selectedCategory === cat.name ? null : cat.name)
                  }
                  className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    selectedCategory === cat.name
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/70 hover:bg-muted text-foreground border-border"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
      <div ref={sentinelRef} className="h-6" />

      {viewerIndex !== null && (
        <GalleryViewer
          items={allItems}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </div>
  );
};

const GalleryViewer = ({
  items,
  startIndex,
  onClose,
}: {
  items: GalleryItem[];
  startIndex: number;
  onClose: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current?.querySelector<HTMLElement>(`[data-idx="${startIndex}"]`);
    el?.scrollIntoView({ block: "start" });
  }, [startIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[120] bg-background"
    >
      <div className="sticky top-0 z-10 flex items-center gap-3 px-3 h-14 border-b border-border bg-background/95 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-bold text-foreground">Explore</h2>
        <Button variant="ghost" size="icon" className="ml-auto" onClick={onClose} aria-label="Close">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div
        ref={containerRef}
        className="h-[calc(100vh-3.5rem)] overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto w-full max-w-[560px] pb-16 space-y-1 sm:space-y-4">
          {items.map((item, idx) => (
            <div key={item.id} data-idx={idx}>
              <InstaPost
                id={item.id}
                content={item.caption}
                media_url={item.image}
                category={item.category}
                likes_count={item.likes}
                comments_count={item.comments}
                shares_count={Math.max(1, Math.round(item.likes * 0.09))}
                author={item.author}
                avatar={item.avatar}
                time={`${1 + (idx % 23)}h`}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ExploreGallery;
