import { ArrowLeft, Calendar, MapPin, Link as LinkIcon, Users, Briefcase, MoreHorizontal, Flag, Ban, Share2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ReportDialog from "@/components/ReportDialog";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ShareProfileModal from "@/components/ShareProfileModal";
import { chatPath, isFollowing as graphIsFollowing, toggleFollow, slugify } from "@/lib/socialGraph";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import Post from "@/components/Post";
import { suggestedUsers } from "@/components/PeopleYouMayKnow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image } from "lucide-react";

const userProfiles: Record<number, { bio: string; location: string; website: string; joined: string; followers: number; following: number; posts: number; coverColor: string }> = {
  1: { bio: "UX Designer & Cat lover 🐱 | Creating beautiful experiences", location: "New York, NY", website: "jessicalee.design", joined: "January 2023", followers: 2400, following: 680, posts: 95, coverColor: "from-rose-500 to-pink-600" },
  2: { bio: "Software Engineer at Tech Co 💻 | Open source contributor", location: "Seattle, WA", website: "davidpark.dev", joined: "March 2023", followers: 1800, following: 420, posts: 67, coverColor: "from-blue-500 to-indigo-600" },
  3: { bio: "Travel photographer 📸 | 30 countries and counting", location: "London, UK", website: "oliviabrown.photo", joined: "June 2023", followers: 5200, following: 310, posts: 203, coverColor: "from-amber-500 to-orange-600" },
  4: { bio: "Fitness coach & Nutrition expert 💪", location: "Austin, TX", website: "jameswilson.fit", joined: "September 2023", followers: 980, following: 150, posts: 45, coverColor: "from-green-500 to-emerald-600" },
  5: { bio: "Artist & Illustrator 🎨 | Commissions open", location: "Portland, OR", website: "sophiadavis.art", joined: "February 2023", followers: 7800, following: 520, posts: 312, coverColor: "from-purple-500 to-violet-600" },
  6: { bio: "Music producer 🎵 | Beats & melodies", location: "Los Angeles, CA", website: "liammartinez.music", joined: "April 2023", followers: 3100, following: 290, posts: 78, coverColor: "from-cyan-500 to-teal-600" },
  7: { bio: "Food blogger & Chef 🍳 | Recipes from around the world", location: "Chicago, IL", website: "avathompson.food", joined: "July 2023", followers: 4500, following: 380, posts: 156, coverColor: "from-red-500 to-rose-600" },
  8: { bio: "Startup founder 🚀 | Building the future", location: "San Francisco, CA", website: "noahgarcia.co", joined: "May 2023", followers: 2200, following: 440, posts: 89, coverColor: "from-sky-500 to-blue-600" },
};

const samplePhotos = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
];

export default function UserProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const queryName = searchParams.get("name");
  const queryAvatar = searchParams.get("avatar");

  const numericId = Number(id);
  const bySlug = suggestedUsers.find(u => slugify(u.name) === (id ?? "")) ??
    (queryName ? suggestedUsers.find(u => slugify(u.name) === slugify(queryName)) : undefined);
  const known = Number.isFinite(numericId) && numericId > 0
    ? suggestedUsers.find(u => u.id === numericId)
    : bySlug;

  const displayName = known?.name ?? queryName ?? "";
  const user = known ?? (displayName
    ? { id: 0, name: displayName, avatar: queryAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`, mutualFriends: 3 }
    : undefined);

  const fallbackProfile = {
    bio: "Sharing moments and ideas ✨",
    location: "Karachi, PK",
    website: `${slugify(displayName || "user")}.social`,
    joined: "March 2024",
    followers: 1240,
    following: 318,
    posts: 42,
    coverColor: "from-primary to-primary/60",
  };
  const profile = (known && userProfiles[known.id]) || (user ? fallbackProfile : undefined);

  const [isFollowing, setIsFollowing] = useState(() => (displayName ? graphIsFollowing(displayName) : false));
  const [activeTab, setActiveTab] = useState("posts");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  if (!user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">User not found</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleFollow = () => {
    const next = toggleFollow({ name: user.name, avatar: user.avatar });
    setIsFollowing(next);
    toast({ title: next ? `Following ${user.name}` : `Unfollowed ${user.name}` });
  };

  const samplePosts = [
    { id: 1, author: user.name, avatar: user.avatar, time: "2 hours ago", content: "Having an amazing day! ✨ Grateful for all the support.", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop", likes: 142, comments: 23 },
    { id: 2, author: user.name, avatar: user.avatar, time: "1 day ago", content: "New project coming soon! Stay tuned 🚀", likes: 89, comments: 12 },
    { id: 3, author: user.name, avatar: user.avatar, time: "3 days ago", content: "Weekend vibes 🌅", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop", likes: 267, comments: 34 },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <TopBar />

      <main className="flex-1 md:ml-64 pb-16 md:pb-8 pt-14 md:pt-14">
        <div className="w-full max-w-[100vw] sm:max-w-xl lg:max-w-[780px] xl:max-w-[850px] mx-auto px-0 sm:px-4 md:px-6 lg:px-8">
          {/* Cover Photo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`relative h-40 sm:h-48 md:h-56 lg:h-64 bg-gradient-to-r ${profile.coverColor} rounded-b-xl md:rounded-b-2xl overflow-hidden`}
          >
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-3 left-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          </motion.div>

          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6"
          >
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 -mt-12 sm:-mt-14 md:-mt-16">
              <Avatar className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border-3 sm:border-4 border-background shadow-lg">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex gap-2 sm:mt-16 md:mt-20 w-full sm:w-auto">
                <Button
                  variant={isFollowing ? "secondary" : "default"}
                  size="sm"
                  className="flex-1 sm:flex-none h-9 sm:h-10 px-6"
                  onClick={handleFollow}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none h-9 sm:h-10 px-6"
                  onClick={() => navigate(chatPath(user.name, user.avatar))}
                >
                  Message
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 sm:h-10 px-3 shrink-0" aria-label="More options">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setIsShareOpen(true)}>
                      <Share2 className="w-4 h-4 mr-2" /> Share profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsReportOpen(true)}>
                      <Flag className="w-4 h-4 mr-2" /> Report user
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setIsBlocked((prev) => !prev);
                        toast({ title: isBlocked ? `Unblocked ${user.name}` : `Blocked ${user.name}` });
                      }}
                    >
                      <Ban className="w-4 h-4 mr-2" /> {isBlocked ? "Unblock user" : "Block user"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{user.name}</h1>
                <p className="text-sm sm:text-base text-muted-foreground">{profile.bio}</p>
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span>{profile.location}</span></div>
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span>Joined {profile.joined}</span></div>
                <div className="flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="text-primary">{profile.website}</span></div>
              </div>
              <div className="flex gap-4 sm:gap-6 text-sm sm:text-base">
                <div><span className="font-bold text-foreground">{profile.followers.toLocaleString()}</span><span className="text-muted-foreground ml-1 text-xs sm:text-sm">Followers</span></div>
                <div><span className="font-bold text-foreground">{profile.following}</span><span className="text-muted-foreground ml-1 text-xs sm:text-sm">Following</span></div>
                <div><span className="font-bold text-foreground">{profile.posts}</span><span className="text-muted-foreground ml-1 text-xs sm:text-sm">Posts</span></div>
              </div>
              <div className="text-xs text-muted-foreground">{user.mutualFriends} mutual friends</div>
            </div>
          </motion.div>

          {/* Social / Work Toggle */}
          <div className="px-3 sm:px-4 md:px-6 mb-4">
            <div className="flex rounded-xl bg-transparent border border-border p-1 gap-1">
              <button onClick={() => setProfileMode("social")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${profileMode === "social" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <Users className="w-4 h-4" /> Social
              </button>
              <button onClick={() => setProfileMode("work")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${profileMode === "work" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <Briefcase className="w-4 h-4" /> Work
              </button>
            </div>
          </div>

          {/* Tabs */}
          {profileMode === "work" ? (
            <div className="px-0 sm:px-4 md:px-6">
              <WorkProfile />
            </div>
          ) : (
          <div className="px-0 sm:px-4 md:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="posts" className="gap-2"><Image className="w-4 h-4" /> Posts</TabsTrigger>
                <TabsTrigger value="photos" className="gap-2"><Image className="w-4 h-4" /> Photos</TabsTrigger>
              </TabsList>


              <TabsContent value="posts" className="space-y-3 sm:space-y-4">
                {samplePosts.map((post, index) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Post {...post} />
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="photos">
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  {samplePhotos.map((photo, index) => (
                    <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                      className="aspect-square overflow-hidden rounded-lg">
                      <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <ShareProfileModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={`${window.location.origin}/user/${slugify(user.name)}?name=${encodeURIComponent(user.name)}`}
        title={`${user.name} on SocialApp`}
      />

      <ReportDialog isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} type="user" />

      <MobileNav />
    </div>
  );
}
