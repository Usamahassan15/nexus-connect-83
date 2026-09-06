import { Heart, MessageCircle, Bookmark, MoreHorizontal, Send, UserPlus, Flag, Ban, Camera, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import EngagementUsersDialog from "./EngagementUsersDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ShareSheet from "./ShareSheet";
import ReportDialog from "./ReportDialog";
import { EmojiPicker } from "./EmojiPicker";
import ImagePreview from "./ImagePreview";
import ModerationWarningDialog from "./ModerationWarningDialog";
import { toast } from "@/hooks/use-toast";
import { useUISound } from "@/hooks/use-ui-sound";
import { useContentModeration } from "@/hooks/use-content-moderation";

interface PostProps {
  author: string;
  avatar: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
}

const Post = ({ author, avatar, time, content, image, likes, comments }: PostProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [likeCount, setLikeCount] = useState(likes);
  const [shareCount, setShareCount] = useState(3);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModerationWarning, setShowModerationWarning] = useState(false);
  const [moderationData, setModerationData] = useState<any>(null);
  const [engagementDialog, setEngagementDialog] = useState<{ type: "likes" | "comments" | "shares" | "saves"; count: number } | null>(null);
  const playLike = useUISound("like");
  const playComment = useUISound("comment");
  const playShare = useUISound("share");
  const playSave = useUISound("save");
  const { moderateText, isChecking } = useContentModeration();

  const handleLike = () => {
    if (!isLiked) playLike();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleComment = async () => {
    if (comment.trim()) {
      const result = await moderateText(comment, "comment");
      if (!result.allowed) {
        setModerationData(result);
        setShowModerationWarning(true);
        return;
      }
      playComment();
      toast({ title: "Comment posted!" });
      setComment("");
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({ title: isFollowing ? `Unfollowed ${author}` : `Following ${author}` });
  };

  const handleBlock = () => {
    toast({ title: `${author} has been blocked` });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({ title: "Image attached to comment" });
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setComment(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-0 overflow-hidden hover-lift rounded-lg sm:rounded-xl border border-border/30 sm:border-border max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-2 sm:px-3 py-2">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 sm:w-9 sm:h-9">
              <AvatarImage src={avatar} />
              <AvatarFallback>{author[0]}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-foreground leading-tight">{author}</h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground">{time}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFollow}
                className={`h-6 px-2 text-[10px] sm:text-xs ${isFollowing ? 'text-muted-foreground' : 'text-primary'}`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleFollow}>
                <UserPlus className="w-4 h-4 mr-2" />
                {isFollowing ? 'Unfollow' : 'Follow'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                <Flag className="w-4 h-4 mr-2" />
                Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBlock} className="text-destructive">
                <Ban className="w-4 h-4 mr-2" />
                Block Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <p className="text-sm sm:text-base text-foreground px-2 sm:px-3 pb-2 leading-relaxed">{content}</p>

        {/* Image - Smaller on mobile */}
        {image && (
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="overflow-hidden bg-muted cursor-pointer"
            onClick={() => setShowImagePreview(true)}
          >
            <AspectRatio ratio={4 / 3} className="w-full">
              <img src={image} alt="Post" className="w-full h-full object-cover" />
            </AspectRatio>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-t border-border/60">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className="flex min-w-[3.25rem] items-center justify-start gap-2 rounded-md py-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Like"
          >
            <AnimatePresence mode="wait">
              {isLiked ? (
                <motion.div
                  key="liked"
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: [0, 1.4, 0.9, 1.1, 1], rotate: [-15, 10, -5, 0] }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                   <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                </motion.div>
              ) : (
                <motion.div key="not-liked" initial={{ scale: 1 }} animate={{ scale: 1 }}>
                   <Heart className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="text-sm font-medium text-foreground" onClick={(e) => { e.stopPropagation(); setEngagementDialog({ type: "likes", count: likeCount }); }}>{likeCount}</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowComments(!showComments)}
            className="flex min-w-[3.25rem] items-center justify-start gap-2 rounded-md py-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Comments"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm font-medium text-foreground">{comments}</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playShare(); setShareCount((count) => count + 1); setShowShareSheet(true); }}
            className="flex min-w-[3.25rem] items-center justify-start gap-2 rounded-md py-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Share"
          >
            <Send className="w-6 h-6" />
            <span className="text-sm font-medium text-foreground" onClick={(e) => { e.stopPropagation(); setEngagementDialog({ type: "shares", count: shareCount }); }}>{shareCount}</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playSave(); setIsSaved(!isSaved); }}
            className="flex items-center justify-center rounded-md py-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Save"
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-primary text-primary' : ''}`} />
          </motion.button>
        </div>

        {/* Comment Input */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="relative flex items-center gap-1 px-2 sm:px-3 py-2 border-t border-border">
                {/* Camera Icon */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </button>

                {/* Emoji Picker */}
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  >
                    <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  </button>
                  <EmojiPicker
                    isOpen={showEmojiPicker}
                    onClose={() => setShowEmojiPicker(false)}
                    onEmojiSelect={handleEmojiSelect}
                  />
                </div>

                <Input 
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                  className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                />
                <Button 
                  size="sm" 
                  onClick={handleComment}
                  disabled={!comment.trim()}
                  className="h-8 sm:h-9 px-2 sm:px-3"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <ShareSheet isOpen={showShareSheet} onClose={() => setShowShareSheet(false)} />
      <ReportDialog isOpen={showReportDialog} onClose={() => setShowReportDialog(false)} type="post" />
      {image && (
        <ImagePreview
          images={[image]}
          isOpen={showImagePreview}
          onClose={() => setShowImagePreview(false)}
        />
      )}
      <ModerationWarningDialog
        isOpen={showModerationWarning}
        onClose={() => setShowModerationWarning(false)}
        warningNumber={moderationData?.warning_number}
        isBanned={moderationData?.is_banned}
        banDurationHours={moderationData?.ban_duration_hours}
        banEndsAt={moderationData?.ban_ends_at}
        message={moderationData?.message}
      />
      {engagementDialog && (
        <EngagementUsersDialog
          isOpen={!!engagementDialog}
          onClose={() => setEngagementDialog(null)}
          type={engagementDialog.type}
          count={engagementDialog.count}
        />
      )}
    </motion.div>
  );
};

export default Post;
