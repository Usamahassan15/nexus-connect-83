import React, { useCallback, useState, memo } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, UserPlus, Flag, Ban, CornerDownRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUISound } from "@/hooks/use-ui-sound";
import { toast } from "@/hooks/use-toast";
import ShareSheet from "./ShareSheet";
import ImagePreview from "./ImagePreview";

export interface InstaComment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  likes: number;
  liked?: boolean;
  replies: InstaComment[];
}

export interface InstaPostProps {
  id: string;
  user_id?: string;
  content: string;
  media_url?: string;
  category?: string;
  is_anonymous?: boolean;
  likes_count: number;
  comments_count: number;
  shares_count?: number;
  saves_count?: number;
  created_at?: string;
  author?: string;
  avatar?: string;
  time?: string;
}

const formatTime = (dateStr?: string) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  if (hrs < 24) return `${hrs}h`;
  return `${days}d`;
};

const SEED_COMMENTS: InstaComment[] = [
  {
    id: "c1",
    author: "Ayesha Malik",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayesha",
    text: "This is so good 🔥",
    likes: 12,
    replies: [
      {
        id: "c1r1",
        author: "Bilal Ahmed",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bilal",
        text: "Agreed, love the details!",
        likes: 3,
        replies: [],
      },
    ],
  },
];

const addReply = (list: InstaComment[], parentId: string, reply: InstaComment): InstaComment[] =>
  list.map((c) =>
    c.id === parentId
      ? { ...c, replies: [...c.replies, reply] }
      : { ...c, replies: addReply(c.replies, parentId, reply) }
  );

const toggleCommentLike = (list: InstaComment[], id: string): InstaComment[] =>
  list.map((c) =>
    c.id === id
      ? { ...c, liked: !c.liked, likes: c.liked ? Math.max(0, c.likes - 1) : c.likes + 1 }
      : { ...c, replies: toggleCommentLike(c.replies, id) }
  );

const CommentNode = ({
  comment,
  depth,
  onLike,
  onReply,
}: {
  comment: InstaComment;
  depth: number;
  onLike: (id: string) => void;
  onReply: (parentId: string, author: string) => void;
}) => (
  <div className={depth > 0 ? "pl-5 sm:pl-7 border-l border-border/60 ml-2" : ""}>
    <div className="flex items-start gap-2 py-1.5">
      <Avatar className="w-7 h-7 mt-0.5">
        {comment.avatar && <AvatarImage src={comment.avatar} alt={comment.author} />}
        <AvatarFallback>{comment.author[0]}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground break-words">
          <span className="font-semibold mr-1.5">{comment.author}</span>
          {comment.text}
        </p>
        <div className="flex items-center gap-4 mt-0.5">
          <button
            onClick={() => onLike(comment.id)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Heart className={`w-3.5 h-3.5 ${comment.liked ? "fill-red-500 text-red-500" : ""}`} />
            {comment.likes > 0 && comment.likes}
          </button>
          <button
            onClick={() => onReply(comment.id, comment.author)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <CornerDownRight className="w-3.5 h-3.5" /> Reply
          </button>
        </div>
      </div>
    </div>
    {comment.replies.map((r) => (
      <CommentNode key={r.id} comment={r} depth={depth + 1} onLike={onLike} onReply={onReply} />
    ))}
  </div>
);

const InstaPost = memo((props: InstaPostProps) => {
  const {
    content,
    media_url,
    category,
    is_anonymous,
    likes_count,
    comments_count,
    shares_count,
    created_at,
    author,
    avatar,
    user_id,
    time,
  } = props;

  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(likes_count);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<InstaComment[]>(SEED_COMMENTS);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCount, setShareCount] = useState(shares_count ?? Math.max(1, Math.round(likes_count * 0.09)));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);



  const playLike = useUISound("like");
  const playComment = useUISound("comment");
  const playShare = useUISound("share");
  const playSave = useUISound("save");

  const displayName = is_anonymous ? "Anonymous" : author || "User";
  const displayAvatar = is_anonymous
    ? undefined
    : avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user_id || displayName}`;

  const totalComments =
    comments_count + comments.reduce((acc, c) => acc + 1 + c.replies.length, 0) - SEED_COMMENTS.length;

  const handleLike = useCallback(() => {
    setIsLiked((prev) => {
      if (!prev) playLike();
      setLikes((l) => (prev ? Math.max(0, l - 1) : l + 1));
      return !prev;
    });
  }, [playLike]);

  const handleSave = useCallback(() => {
    playSave();
    setIsSaved((p) => !p);
    toast({ title: isSaved ? "Removed from saved" : "Saved" });
  }, [isSaved, playSave]);

  const handleShare = useCallback(() => {
    playShare();
    setShareCount((c) => c + 1);
    setShareOpen(true);
  }, [playShare]);


  const submitComment = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    playComment();
    const node: InstaComment = {
      id: `c-${Date.now()}`,
      author: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      text,
      likes: 0,
      replies: [],
    };
    setComments((prev) => (replyTo ? addReply(prev, replyTo.id, node) : [...prev, node]));
    setDraft("");
    setReplyTo(null);
  }, [draft, replyTo, playComment]);

  return (
    <article className="bg-card border-y sm:border sm:rounded-xl border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Avatar className="w-9 h-9">
          {displayAvatar && <AvatarImage src={displayAvatar} alt={displayName} />}
          <AvatarFallback>{displayName[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {category ? `#${category}` : ""}
            {category && created_at ? " · " : ""}
            {formatTime(created_at) || time || ""}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Post options">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <UserPlus className="w-4 h-4 mr-2" /> Follow
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast({ title: "Reported" })}>
              <Flag className="w-4 h-4 mr-2" /> Report
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => toast({ title: "Blocked" })}>
              <Ban className="w-4 h-4 mr-2" /> Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Media */}
      {media_url && (
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="block w-full"
          aria-label="Open image"
        >
          <img
            src={media_url}
            alt={content.slice(0, 80) || "Post image"}
            loading="lazy"
            className="w-full aspect-square object-cover bg-muted"
          />
        </button>
      )}

      {/* Caption first for text-only posts */}
      {!media_url && content && (
        <p className="px-3 pb-1 text-sm text-foreground whitespace-pre-line">
          <span className="font-semibold mr-1.5">{displayName}</span>
          {content}
        </p>
      )}

      {/* Actions */}
      <div className={`flex items-center justify-between px-3 pt-2.5 ${!media_url ? "pb-3" : ""}`}>
        <button
          onClick={handleLike}
          aria-label="Like"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <Heart className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          <span className="text-sm font-semibold text-foreground">{likes.toLocaleString()}</span>
        </button>
        <button
          onClick={() => setShowComments(true)}
          aria-label="Comments"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-sm font-semibold text-foreground">{Math.max(0, totalComments).toLocaleString()}</span>
        </button>
        <button
          onClick={handleShare}
          aria-label="Share"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
        >
          <Send className="w-6 h-6" />
          <span className="text-sm font-semibold text-foreground">{shareCount.toLocaleString()}</span>
        </button>
        <button onClick={handleSave} aria-label="Save" className="active:scale-95">
          <Bookmark className={`w-6 h-6 ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      </div>

      {/* Caption below media posts */}
      {media_url && content && (
        <p className="px-3 pt-2 pb-3 text-sm text-foreground whitespace-pre-line">
          <span className="font-semibold mr-1.5">{displayName}</span>
          {content}
        </p>
      )}

      {/* Comments UI (separate, fullscreen on mobile) */}
      <Dialog open={showComments} onOpenChange={(o) => { setShowComments(o); if (!o) { setReplyTo(null); setShowAllComments(false); } }}>
        <DialogContent className="flex flex-col p-0 gap-0 overflow-hidden w-screen h-[100dvh] max-w-none rounded-none sm:w-full sm:max-w-md sm:h-auto sm:max-h-[80vh] sm:rounded-lg">
          <DialogHeader className="px-4 py-3 border-b border-border shrink-0">
            <DialogTitle className="text-base">Comments</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-3 py-2 sm:max-h-[55vh]">
            {visibleComments.map((c) => (
              <CommentNode
                key={c.id}
                comment={c}
                depth={0}
                onLike={(id) => setComments((prev) => toggleCommentLike(prev, id))}
                onReply={(id, a) => setReplyTo({ id, author: a })}
              />
            ))}
          </div>
          {!showAllComments && comments.length > 2 && (
            <button
              onClick={() => setShowAllComments(true)}
              className="px-4 py-2 text-left text-sm text-muted-foreground hover:text-foreground border-t border-border shrink-0"
            >
              View all {Math.max(0, totalComments).toLocaleString()} comments
            </button>
          )}
          <div className="px-3 py-2.5 border-t border-border shrink-0">
            {replyTo && (
              <div className="flex items-center justify-between pb-1.5 text-xs text-muted-foreground">
                <span>Replying to {replyTo.author}</span>
                <button onClick={() => setReplyTo(null)} className="font-medium hover:text-foreground">
                  Cancel
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                placeholder={replyTo ? `Reply to ${replyTo.author}...` : "Add a comment..."}
                className="h-9 flex-1 text-sm"
              />
              <Button size="sm" className="h-9 px-3" disabled={!draft.trim()} onClick={submitComment}>
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      <ShareSheet isOpen={shareOpen} onClose={() => setShareOpen(false)} />
      {media_url && previewOpen && (
        <ImagePreview images={[media_url]} isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />
      )}
    </article>
  );
});


InstaPost.displayName = "InstaPost";

export default InstaPost;
