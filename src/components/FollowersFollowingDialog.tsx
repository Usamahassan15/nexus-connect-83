import { useEffect, useState } from "react";
import { Search, UserPlus, UserCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { getFollowing, getFollowers, unfollowUser } from "@/lib/socialGraph";

interface User {
  id: number;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  isFollowing: boolean;
}

const initialFollowers: User[] = [
  { id: 1, name: "Sarah Wilson", username: "@sarahw", bio: "Photographer 📸", avatar: "Sarah", isFollowing: true },
  { id: 2, name: "Michael Chen", username: "@mikec", bio: "Designer & coffee addict", avatar: "Michael", isFollowing: false },
  { id: 3, name: "Emma Thompson", username: "@emmat", bio: "Travel blogger ✈️", avatar: "Emma", isFollowing: true },
  { id: 4, name: "David Kim", username: "@davidk", bio: "Software engineer", avatar: "David", isFollowing: false },
  { id: 5, name: "Lisa Park", username: "@lisap", bio: "Yoga instructor 🧘‍♀️", avatar: "Lisa", isFollowing: true },
  { id: 6, name: "James Rodriguez", username: "@jamesr", bio: "Music producer 🎵", avatar: "James", isFollowing: false },
];

const initialFollowing: User[] = [
  { id: 7, name: "Anna Smith", username: "@annas", bio: "Artist & illustrator", avatar: "Anna", isFollowing: true },
  { id: 8, name: "Tom Hardy", username: "@tomh", bio: "Fitness coach 💪", avatar: "Tom", isFollowing: true },
  { id: 9, name: "Olivia Brown", username: "@oliviab", bio: "Foodie & writer", avatar: "Olivia", isFollowing: true },
  { id: 10, name: "Ryan Lee", username: "@ryanl", bio: "Entrepreneur", avatar: "Ryan", isFollowing: true },
  { id: 11, name: "Sophie Martin", username: "@sophiem", bio: "Fashion designer 👗", avatar: "Sophie", isFollowing: true },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "followers" | "following";
  followersCount?: string;
  followingCount?: string;
}

export default function FollowersFollowingDialog({ isOpen, onClose, initialTab = "followers", followersCount = "1.2K", followingCount = "842" }: Props) {
  const graphToUsers = (list: { key: string; name: string; avatar?: string }[], offset: number): User[] =>
    list.map((u, i) => ({
      id: offset + i,
      name: u.name,
      username: `@${u.key}`,
      bio: "",
      avatar: u.avatar || u.name,
      isFollowing: true,
    }));

  const [followers, setFollowers] = useState<User[]>(() => [...graphToUsers(getFollowers(), 10000), ...initialFollowers]);
  const [following, setFollowing] = useState<User[]>(() => [...graphToUsers(getFollowing(), 20000), ...initialFollowing]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setFollowers([...graphToUsers(getFollowers(), 10000), ...initialFollowers]);
    setFollowing([...graphToUsers(getFollowing(), 20000), ...initialFollowing]);
  }, [isOpen]);

  const toggleFollower = (id: number) => {
    setFollowers(prev => prev.map(u => {
      if (u.id === id) {
        toast({ title: u.isFollowing ? `Unfollowed ${u.name}` : `Following ${u.name}` });
        return { ...u, isFollowing: !u.isFollowing };
      }
      return u;
    }));
  };

  const unfollow = (id: number) => {
    const user = following.find(u => u.id === id);
    if (user) unfollowUser(user.name);
    setFollowing(prev => prev.filter(u => u.id !== id));
    if (user) toast({ title: `Unfollowed ${user.name}` });
  };

  const filter = (list: User[]) => list.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] p-0 max-h-[85dvh] overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>Connections</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={initialTab} className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="grid grid-cols-2 mx-4">
            <TabsTrigger value="followers">Followers · {followersCount}</TabsTrigger>
            <TabsTrigger value="following">Following · {followingCount}</TabsTrigger>
          </TabsList>
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" className="pl-9 h-9 text-sm" />
            </div>
          </div>

          <TabsContent value="followers" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-[55dvh] px-2">
              <div className="space-y-1 py-1">
                {filter(followers).map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={user.avatar.startsWith("http") ? user.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
                    </div>
                    <Button size="sm" variant={user.isFollowing ? "outline" : "default"} onClick={() => toggleFollower(user.id)} className="h-8 text-xs gap-1">
                      {user.isFollowing ? <><UserCheck className="w-3 h-3" /> Following</> : <><UserPlus className="w-3 h-3" /> Follow</>}
                    </Button>
                  </div>
                ))}
                {filter(followers).length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No users found</p>}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="following" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-[55dvh] px-2">
              <div className="space-y-1 py-1">
                {filter(following).map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={user.avatar.startsWith("http") ? user.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => unfollow(user.id)} className="h-8 text-xs">
                      Unfollow
                    </Button>
                  </div>
                ))}
                {filter(following).length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No users found</p>}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
