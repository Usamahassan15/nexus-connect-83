import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import TopBar from "@/components/TopBar";
import Stories from "@/components/Stories";
import PeopleYouMayKnow from "@/components/PeopleYouMayKnow";
import CreatePost from "@/components/CreatePost";
import FeedTypeSelector from "@/components/FeedTypeSelector";
import TrendingSection from "@/components/TrendingSection";
import InstaPost from "@/components/InstaPost";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFeed } from "@/hooks/use-feed";
import { Layout } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const SUGGESTED_POSTS = [
  {
    id: "suggested-1",
    user_id: "user-1",
    content: "Just launched our new AI-powered design tool! 🚀 It can generate stunning UI mockups in seconds. What do you think about AI in the design workflow?",
    media_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
    media_type: "image",
    category: "technology",
    is_anonymous: false,
    likes_count: 234,
    comments_count: 45,
    shares_count: 18,
    saves_count: 67,
    views_count: 1200,
    quality_score: 0.9,
    engagement_rate: 0.15,
    is_trending: true,
    is_featured: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    author: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    id: "suggested-2",
    user_id: "user-2",
    content: "5 lessons I learned from building my startup from scratch 💡\n\n1. Start small, think big\n2. Talk to your users daily\n3. Ship fast, iterate faster\n4. Build a great team\n5. Never stop learning",
    category: "startup",
    is_anonymous: false,
    likes_count: 512,
    comments_count: 89,
    shares_count: 156,
    saves_count: 203,
    views_count: 5400,
    quality_score: 0.95,
    engagement_rate: 0.22,
    is_trending: true,
    is_featured: true,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    author: "Alex Rivera",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
  {
    id: "suggested-3",
    user_id: "user-3",
    content: "Beautiful sunset captured during my trip to Bali 🌅 Nature never fails to amaze me. Sometimes you need to disconnect to reconnect.",
    media_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    media_type: "image",
    category: "travel",
    is_anonymous: false,
    likes_count: 789,
    comments_count: 34,
    shares_count: 56,
    saves_count: 123,
    views_count: 3200,
    quality_score: 0.85,
    engagement_rate: 0.18,
    is_trending: false,
    is_featured: false,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    author: "Maya Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
  },
  {
    id: "suggested-4",
    user_id: "user-4",
    content: "The future of web development is here! 🔥 WebAssembly + AI = mind-blowing possibilities. Who else is excited about this tech stack?",
    category: "ai",
    is_anonymous: false,
    likes_count: 345,
    comments_count: 67,
    shares_count: 45,
    saves_count: 89,
    views_count: 2100,
    quality_score: 0.88,
    engagement_rate: 0.2,
    is_trending: false,
    is_featured: false,
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    author: "Ryan Kim",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan",
  },
  {
    id: "suggested-5",
    user_id: "user-5",
    content: "Just finished reading 'Atomic Habits' by James Clear. Game changer! 📚 Small changes really do compound into remarkable results. What's your favorite productivity book?",
    media_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop",
    media_type: "image",
    category: "lifestyle",
    is_anonymous: false,
    likes_count: 456,
    comments_count: 123,
    shares_count: 78,
    saves_count: 234,
    views_count: 4500,
    quality_score: 0.92,
    engagement_rate: 0.25,
    is_trending: true,
    is_featured: false,
    created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    author: "Emma Wilson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
  },
  {
    id: "suggested-6",
    user_id: "user-6",
    content: "New music drop! 🎵 Been working on this track for 3 months. Electronic meets jazz - a fusion that I think you'll love. Let me know what you think!",
    category: "music",
    is_anonymous: false,
    likes_count: 189,
    comments_count: 42,
    shares_count: 23,
    saves_count: 56,
    views_count: 1800,
    quality_score: 0.8,
    engagement_rate: 0.14,
    is_trending: false,
    is_featured: false,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    author: "DJ Marcus",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
  },
];

const FeedSkeleton = () => (
  <Card className="p-4 space-y-3">
    <div className="flex items-center gap-2">
      <Skeleton className="w-9 h-9 rounded-full" />
      <div className="space-y-1 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="grid grid-cols-4 gap-2">
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-8" />)}
    </div>
  </Card>
);

const Home = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [feedType, setFeedType] = useState<"personalized" | "following" | "trending" | "latest">("personalized");
  
  const { posts, trending, isLoading, refresh, loadMore, hasMore } = useFeed({
    feedType,
    limit: 10,
  });

  const filteredSuggested = React.useMemo(() => {
    const arr = [...SUGGESTED_POSTS];
    switch (feedType) {
      case "trending":
        return arr.filter(p => p.is_trending).sort((a, b) => b.likes_count - a.likes_count);
      case "latest":
        return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "following":
        return arr.filter((_, i) => i % 2 === 0);
      case "personalized":
      default:
        return arr.sort((a, b) => b.engagement_rate - a.engagement_rate);
    }
  }, [feedType]);

  const feedPosts = posts.length > 0 ? posts : (isLoading ? [] : filteredSuggested);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <TopBar />

      <main className="flex-1 pb-16 md:pb-8 pt-14 md:pt-14">
        <div className="w-full max-w-[100vw] sm:max-w-xl lg:max-w-[560px] mx-auto px-0 sm:px-4 md:px-6 lg:px-0 pt-0 sm:pt-0 md:pt-1 overflow-hidden">
          {/* Stories */}
          <div className="mb-3 sm:mb-4">
            <Stories />
          </div>

          {/* Feed Type Selector */}
          <div className="mb-3 sm:mb-4">
            <FeedTypeSelector
              value={feedType}
              onChange={(val) => setFeedType(val as any)}
            />
          </div>

          {/* Trending topics (compact) */}
          {trending.length > 0 && feedType === "personalized" && (
            <div className="mb-3 sm:mb-4">
              <TrendingSection variant="compact" />
            </div>
          )}

          {/* Feed - render suggested posts immediately, replace when live data arrives */}
          <div className="space-y-1 sm:space-y-4">
            {isLoading && posts.length === 0 && (
              <div className="space-y-1 sm:space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <FeedSkeleton key={i} />
                ))}
              </div>
            )}

            {!isLoading && feedPosts.length === 0 && (
              <div className="py-12">
                <EmptyState icon={Layout} title="No posts yet" description="Follow more people or explore categories to fill your feed." />
              </div>
            )}
            {feedPosts.map((post, index) => (
              <React.Fragment key={post.id}>
                {index === 3 && <PeopleYouMayKnow />}
                <InstaPost {...post} />
              </React.Fragment>
            ))}

            {/* Load More */}
            {!isLoading && posts.length > 0 && (
              <div className="flex gap-2 pb-4">
                {hasMore && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={loadMore}
                  >
                    Load More
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refresh}
                  title="Refresh feed"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileNav />

      {/* FAB */}
      <div className="hidden md:block fixed bottom-8 right-6 z-40">
        <Button
          size="icon"
          onClick={() => setIsCreatePostOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-7 h-7" />
        </Button>
      </div>

      <CreatePost isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />
    </div>
  );
};

export default Home;