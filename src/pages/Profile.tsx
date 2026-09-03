import { Calendar, MapPin, Link as LinkIcon, Camera, Edit, Plus, Settings, Image, Type, Briefcase, Users, BadgeCheck, Share2, Bookmark, Grid3x3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/hooks/use-toast";
import WorkProfile from "@/components/profile/WorkProfile";
import SocialProfile from "@/components/profile/SocialProfile";
import FollowersFollowingDialog from "@/components/FollowersFollowingDialog";
import ShareProfileModal from "@/components/ShareProfileModal";
import { savedPostsMock } from "@/lib/savedPosts";
import InstaPost from "@/components/InstaPost";

export default function Profile() {
  const navigate = useNavigate();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isStoryOptionsOpen, setIsStoryOptionsOpen] = useState(false);
  const [isTextStoryOpen, setIsTextStoryOpen] = useState(false);
  const [storyBackground, setStoryBackground] = useState("#199AE3");
  const [profileMode, setProfileMode] = useState<"social" | "work">("social");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isCoverPreviewOpen, setIsCoverPreviewOpen] = useState(false);
  const [connectionsTab, setConnectionsTab] = useState<"followers" | "following" | null>(null);
  const [isShareProfileOpen, setIsShareProfileOpen] = useState(false);
  const [contentTab, setContentTab] = useState<"posts" | "saved">("posts");
  const [isLoading, setIsLoading] = useState(true);
  const isVerified = true;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);
  
  const [profileData, setProfileData] = useState({
    name: "Alex Johnson",
    bio: "Digital creator | Travel enthusiast | Coffee lover ☕",
    location: "San Francisco, CA",
    website: "alexjohnson.com"
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Image selected:", file);
      setIsStoryOptionsOpen(false);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
      setIsCoverPreviewOpen(true);
    }
    // Reset input so same file can be re-selected
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const saveCoverImage = () => {
    if (coverPreview) {
      setCoverImage(coverPreview);
      setIsCoverPreviewOpen(false);
      toast({ title: "Cover photo updated" });
    }
  };

  const cancelCoverPreview = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setIsCoverPreviewOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      
      <main className="flex-1 pb-16 md:pb-8 pt-14 md:pt-14">
        <div className="w-full max-w-[100vw] sm:max-w-xl lg:max-w-[560px] mx-auto px-0 sm:px-4 md:px-6 lg:px-0">
          {/* Cover Photo */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-40 sm:h-48 md:h-56 lg:h-64 bg-gradient-to-r from-primary to-primary-glow rounded-b-xl md:rounded-b-2xl overflow-hidden"
          >
            {coverImage && (
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover absolute inset-0" />
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverSelect}
            />
            <Button 
              variant="secondary" 
              size="sm"
              className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 gap-2 h-8 sm:h-9 text-xs sm:text-sm"
              onClick={() => coverInputRef.current?.click()}
            >
              <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Edit Cover</span>
            </Button>
          </motion.div>

          {/* Profile Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6"
          >
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 -mt-12 sm:-mt-14 md:-mt-16">
              <div className="relative">
                <Avatar className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border-3 sm:border-4 border-background shadow-lg">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                  <AvatarFallback>AJ</AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => console.log("Profile photo:", e.target.files?.[0])} />
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                  </div>
                </label>
              </div>
              <div className="flex flex-wrap gap-2 sm:mt-16 md:mt-20 w-full sm:w-auto">
                <Button variant="default" size="sm" className="gap-2 flex-1 sm:flex-none h-9 sm:h-10" onClick={() => setIsEditProfileOpen(true)}>
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" /> Edit Profile
                </Button>
                <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none h-9 sm:h-10" onClick={() => setIsStoryOptionsOpen(true)}>
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Your Story
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10" onClick={() => setIsShareProfileOpen(true)}>
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10" onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 flex items-center gap-1.5">
                  {profileData.name}
                  {isVerified && <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">{profileData.bio}</p>
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 sm:gap-2"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span>{profileData.location}</span></div>
                <div className="flex items-center gap-1.5 sm:gap-2"><Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span>Joined March 2024</span></div>
                <div className="flex items-center gap-1.5 sm:gap-2"><LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><a href="#" className="text-primary hover:underline">{profileData.website}</a></div>
              </div>
              <div className="flex gap-4 sm:gap-6 text-sm sm:text-base">
                <button onClick={() => setConnectionsTab("followers")} className="hover:opacity-80 transition-opacity"><span className="font-bold text-foreground">1.2K</span><span className="text-muted-foreground ml-1 text-xs sm:text-sm">Followers</span></button>
                <button onClick={() => setConnectionsTab("following")} className="hover:opacity-80 transition-opacity"><span className="font-bold text-foreground">842</span><span className="text-muted-foreground ml-1 text-xs sm:text-sm">Following</span></button>
                <div><span className="font-bold text-foreground">145</span><span className="text-muted-foreground ml-1 text-xs sm:text-sm">Posts</span></div>
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="px-3 sm:px-4 md:px-6 space-y-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : (
            <>
              {/* Work / Social Toggle */}
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

              {/* Dynamic Content */}
              <div className="px-0 sm:px-4 md:px-6 lg:px-0">
                <div className="w-full max-w-[560px]">
                  <AnimatePresence mode="wait">
                    <motion.div key={profileMode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                      {profileMode === "work" ? <WorkProfile /> : <SocialProfile />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

            </>
          )}
        </div>
      </main>

      <MobileNav />

      <FollowersFollowingDialog
        isOpen={connectionsTab !== null}
        onClose={() => setConnectionsTab(null)}
        initialTab={connectionsTab ?? "followers"}
      />

      <ShareProfileModal isOpen={isShareProfileOpen} onClose={() => setIsShareProfileOpen(false)} />

      {/* Cover Photo Preview Dialog */}
      <Dialog open={isCoverPreviewOpen} onOpenChange={(open) => !open && cancelCoverPreview()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Preview Cover Photo</DialogTitle>
            <DialogDescription>Review your new cover photo before saving.</DialogDescription>
          </DialogHeader>
          {coverPreview && (
            <div className="rounded-lg overflow-hidden">
              <img src={coverPreview} alt="Cover preview" className="w-full aspect-[16/6] object-cover" />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={cancelCoverPreview}>Cancel</Button>
            <Button onClick={saveCoverImage}>Save Cover</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your personal information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} /></div>
            <div className="space-y-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} rows={3} /></div>
            <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" value={profileData.location} onChange={(e) => setProfileData({...profileData, location: e.target.value})} /></div>
            <div className="space-y-2"><Label htmlFor="website">Website</Label><Input id="website" value={profileData.website} onChange={(e) => setProfileData({...profileData, website: e.target.value})} /></div>
            <Button className="w-full" onClick={() => setIsEditProfileOpen(false)}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story Options Dialog */}
      <Dialog open={isStoryOptionsOpen} onOpenChange={setIsStoryOptionsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Your Story</DialogTitle>
            <DialogDescription>Choose how you want to share your story</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <label className="block">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Button variant="outline" className="w-full gap-2 h-12" asChild><span className="cursor-pointer"><Image className="w-5 h-5" /> Create a Photo Story</span></Button>
            </label>
            <Button variant="outline" className="w-full gap-2 h-12" onClick={() => { setIsStoryOptionsOpen(false); setIsTextStoryOpen(true); }}>
              <Type className="w-5 h-5" /> Create a Text Story
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Text Story Dialog */}
      <Dialog open={isTextStoryOpen} onOpenChange={setIsTextStoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Text Story</DialogTitle>
            <DialogDescription>Share your thoughts with a colorful background</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2 flex-wrap">
                {['#199AE3', '#E31199', '#11E399', '#E39911', '#9911E3', '#11E3E3'].map((color) => (
                  <button key={color} className="w-10 h-10 rounded-full border-2 border-border" style={{ backgroundColor: color }} onClick={() => setStoryBackground(color)} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="story-text">Your Story</Label>
              <div className="rounded-lg p-6 min-h-[200px] flex items-center justify-center" style={{ backgroundColor: storyBackground }}>
                <Textarea id="story-text" placeholder="Type your story here..." className="bg-transparent border-none text-white text-center text-lg placeholder:text-white/70 resize-none" rows={5} />
              </div>
            </div>
            <Button className="w-full" onClick={() => setIsTextStoryOpen(false)}>Post Story</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
