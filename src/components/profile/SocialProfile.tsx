import { Image, MoreVertical, Edit, Trash2, Pin } from "lucide-react";
import ImagePreview from "@/components/ImagePreview";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import InstaPost from "@/components/InstaPost";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface UserPost {
  id: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  pinned?: boolean;
}

const initialPosts: UserPost[] = [
  {
    id: 1, author: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
    time: "1 day ago", content: "Excited to share my latest achievement! 🎉",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
    likes: 342, comments: 67,
  },
  {
    id: 2, author: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
    time: "3 days ago", content: "Beautiful morning walk today! 🌅",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    likes: 189, comments: 23,
  },
];

const userPhotos = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
];

export default function SocialProfile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState<UserPost[]>(initialPosts);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const sortedPosts = [...posts].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handleEdit = useCallback((post: UserPost) => {
    setEditingId(post.id);
    setEditContent(post.content);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingId === null) return;
    setPosts(prev => prev.map(p => p.id === editingId ? { ...p, content: editContent } : p));
    setEditingId(null);
    setEditContent("");
    toast({ title: "Post updated" });
  }, [editingId, editContent]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditContent("");
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId === null) return;
    setPosts(prev => prev.filter(p => p.id !== deleteId));
    setDeleteId(null);
    toast({ title: "Post deleted" });
  }, [deleteId]);

  const togglePin = useCallback((id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, pinned: !p.pinned } : p));
    const post = posts.find(p => p.id === id);
    toast({ title: post?.pinned ? "Post unpinned" : "Post pinned to top" });
  }, [posts]);

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4 bg-transparent p-0 gap-1 px-3 sm:px-0 lg:px-6">
          <TabsTrigger value="posts" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Image className="w-4 h-4" /> Posts
          </TabsTrigger>
          <TabsTrigger value="photos" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Image className="w-4 h-4" /> Photos
          </TabsTrigger>
        </TabsList>


        <TabsContent value="posts" className="space-y-1 sm:space-y-4">

          {sortedPosts.map((post) => (
            <div key={post.id} className="relative">
              {/* Pin indicator */}
              {post.pinned && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 px-2">
                  <Pin className="w-3 h-3" /> Pinned post
                </div>
              )}

              {/* 3-dot menu overlay */}
              <div className="absolute top-2 right-2 z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/60 backdrop-blur-sm rounded-full">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => handleEdit(post)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteId(post.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => togglePin(post.id)}>
                      <Pin className="w-4 h-4 mr-2" /> {post.pinned ? "Unpin Post" : "Pin Post"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Inline edit mode or normal post */}
              {editingId === post.id ? (
                <div className="border border-border rounded-xl p-3 space-y-3 bg-card">
                  <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} className="text-sm" />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                    <Button size="sm" onClick={saveEdit}>Save</Button>
                  </div>
                </div>
              ) : (
                <InstaPost id={String(post.id)} content={post.content} media_url={post.image} likes_count={post.likes} comments_count={post.comments} author={post.author} avatar={post.avatar} time={post.time} />
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="photos">
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {userPhotos.map((photo, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => { setPreviewIndex(index); setPreviewOpen(true); }}
              >
                <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The post will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ImagePreview
        images={userPhotos}
        initialIndex={previewIndex}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
