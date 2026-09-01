import { motion } from "framer-motion";
import { Search, X, Users, Layers, TrendingUp, Flame, Sparkles, AtSign, Car, Clock, MessageSquare } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import TopBar from "@/components/TopBar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import TrendingSection from "@/components/TrendingSection";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useFeed, useTrendingTopics } from "@/hooks/use-feed";
import LivePost from "@/components/LivePost";
import { EmptyState } from "@/components/ui/empty-state";
import ExploreGallery from "@/components/ExploreGallery";


const mockPeople = [
  { id: 1, name: "Sarah Connor", username: "@sarahconnor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", bio: "Tech enthusiast & designer", mutualFriends: 12 },
  { id: 2, name: "John Smith", username: "@johnsmith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John", bio: "Full-stack developer", mutualFriends: 5 },
  { id: 3, name: "Emma Watson", username: "@emmawatson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", bio: "UX Researcher | Coffee lover", mutualFriends: 8 },
];

const mockGroups = [
  { id: 1, name: "React Developers", members: "15.2K", image: "https://api.dicebear.com/7.x/shapes/svg?seed=react", category: "Technology" },
  { id: 2, name: "UI/UX Design Hub", members: "8.4K", image: "https://api.dicebear.com/7.x/shapes/svg?seed=design", category: "Design" },
  { id: 3, name: "Startup Founders", members: "22.1K", image: "https://api.dicebear.com/7.x/shapes/svg?seed=startup", category: "Business" },
];

const mockPosts = [
  { id: 1, author: "Sarah Connor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", content: "Just launched my new portfolio site! Check it out 🚀", image: "https://picsum.photos/seed/post1/400/250" },
  { id: 2, author: "John Smith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John", content: "Debugging React hooks at 2am, send help 😅", image: null },
  { id: 3, author: "Emma Watson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", content: "User research tips that changed how I design products.", image: "https://picsum.photos/seed/post3/400/250" },
];

const mockServices = [
  { id: 1, name: "Home Cleaning Pro", category: "Cleaning", rating: 4.8, price: "$25/hr" },
  { id: 2, name: "QuickFix Plumbing", category: "Plumbing", rating: 4.6, price: "$40/hr" },
  { id: 3, name: "Bright Tutors", category: "Education", rating: 4.9, price: "$20/hr" },
];

const mockTransport = [
  { id: 1, route: "Downtown Express", type: "Bus", eta: "5 min", price: "$2.50" },
  { id: 2, route: "Airport Shuttle", type: "Van", eta: "12 min", price: "$8.00" },
  { id: 3, route: "City Loop", type: "Tram", eta: "3 min", price: "$1.75" },
];

const mockHashtags = [
  { id: 1, tag: "#technology", posts: "2.4M" },
  { id: 2, tag: "#design", posts: "1.1M" },
  { id: 3, tag: "#startup", posts: "890K" },
  { id: 4, tag: "#ai", posts: "3.2M" },
];

const TRENDING_SEARCHES = ["technology", "design", "startup", "#ai", "John Smith"];
const SUGGESTED_SEARCHES = ["cleaning services", "downtown bus", "react developers", "#design"];

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

const RECENT_KEY = "recent_searches";

const Explore = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  const { posts: trendingPosts, isLoading: loadingTrending } = useFeed({ feedType: "trending", limit: 6 });
  const { data: topics } = useTrendingTopics();

  useEffect(() => {
    if (!isSearching) return;
    setIsLoadingResults(true);
    const timeout = setTimeout(() => setIsLoadingResults(false), 250 + Math.random() * 150);
    return () => clearTimeout(timeout);
  }, [searchQuery, isSearching]);

  const saveRecentSearch = (q: string) => {
    if (!q.trim()) return;
    setRecentSearches(prev => {
      const next = [q, ...prev.filter(s => s.toLowerCase() !== q.toLowerCase())].slice(0, 10);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeRecentSearch = (q: string) => {
    setRecentSearches(prev => {
      const next = prev.filter(s => s !== q);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_KEY);
  };

  const runSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) saveRecentSearch(q);
  };

  const filteredPeople = useMemo(() =>
    mockPeople.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.username.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );
  const filteredPosts = useMemo(() =>
    mockPosts.filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()) || p.author.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );
  const filteredServices = useMemo(() =>
    mockServices.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );
  const filteredTransport = useMemo(() =>
    mockTransport.filter(t => t.route.toLowerCase().includes(searchQuery.toLowerCase()) || t.type.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );
  const filteredHashtags = useMemo(() =>
    mockHashtags.filter(h => h.tag.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  const hasResults = filteredPeople.length > 0 || filteredPosts.length > 0 || filteredServices.length > 0 || filteredTransport.length > 0 || filteredHashtags.length > 0;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <TopBar />

      <main className="flex-1 pb-16 md:pb-8 pt-1 md:pt-14 fixed md:relative inset-0 md:inset-auto z-50 md:z-auto bg-background">
        <div className="w-full max-w-3xl mx-auto lg:max-w-[980px] xl:max-w-[1040px] px-2 sm:px-4 md:px-6 lg:px-6 pt-0 md:pt-6 h-full overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Explore</h1>
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="md:hidden h-9 w-9">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search people, posts, services, transport, hashtags..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => searchQuery.trim() && saveRecentSearch(searchQuery)}
                onKeyDown={(e) => e.key === "Enter" && searchQuery.trim() && saveRecentSearch(searchQuery)}
              />
              {searchQuery && (
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setSearchQuery("")}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>

          {isSearching ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3 sm:flex sm:overflow-x-auto h-auto sm:h-10 mb-4 gap-1">
                  <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                  <TabsTrigger value="people" className="text-xs sm:text-sm">People</TabsTrigger>
                  <TabsTrigger value="posts" className="text-xs sm:text-sm">Posts</TabsTrigger>
                  <TabsTrigger value="services" className="text-xs sm:text-sm">Services</TabsTrigger>
                  <TabsTrigger value="transport" className="text-xs sm:text-sm">Rides</TabsTrigger>
                  <TabsTrigger value="hashtags" className="text-xs sm:text-sm">Hashtags</TabsTrigger>
                </TabsList>

                {isLoadingResults ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="p-3 flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    {!hasResults && (
                      <EmptyState
                        icon={Search}
                        title="No results found"
                        description={`We couldn't find anything matching "${searchQuery}". Try a different search term.`}
                        actionLabel="Clear Search"
                        onAction={() => setSearchQuery("")}
                      />
                    )}

                    <TabsContent value="all" className="space-y-4">
                      {filteredPeople.length > 0 && (
                        <SearchSection title="People" icon={<Users className="w-4 h-4" />}>
                          {filteredPeople.map(person => <PersonCard key={person.id} person={person} onClick={() => navigate(`/user/${person.id}`)} />)}
                        </SearchSection>
                      )}
                      {filteredPosts.length > 0 && (
                        <SearchSection title="Posts" icon={<MessageSquare className="w-4 h-4" />}>
                          {filteredPosts.map(post => <PostCard key={post.id} post={post} onClick={() => navigate(`/post/${post.id}`)} />)}
                        </SearchSection>
                      )}
                      {filteredServices.length > 0 && (
                        <SearchSection title="Services" icon={<Layers className="w-4 h-4" />}>
                          {filteredServices.map(service => <ServiceCard key={service.id} service={service} onClick={() => navigate("/services")} />)}
                        </SearchSection>
                      )}
                      {filteredTransport.length > 0 && (
                        <SearchSection title="Rides" icon={<Car className="w-4 h-4" />}>
                          {filteredTransport.map(route => <TransportCard key={route.id} route={route} onClick={() => navigate("/transport")} />)}
                        </SearchSection>
                      )}
                      {filteredHashtags.length > 0 && (
                        <SearchSection title="Hashtags" icon={<AtSign className="w-4 h-4" />}>
                          {filteredHashtags.map(h => <HashtagCard key={h.id} hashtag={h} onClick={() => setSearchQuery(h.tag.replace("#", ""))} />)}
                        </SearchSection>
                      )}
                    </TabsContent>
                    <TabsContent value="people" className="space-y-2">
                      {filteredPeople.length > 0 ? filteredPeople.map(person => <PersonCard key={person.id} person={person} onClick={() => navigate(`/user/${person.id}`)} />) : <EmptyState icon={Search} title="No results found" />}
                    </TabsContent>
                    <TabsContent value="posts" className="space-y-2">
                      {filteredPosts.length > 0 ? filteredPosts.map(post => <PostCard key={post.id} post={post} onClick={() => navigate(`/post/${post.id}`)} />) : <EmptyState icon={Search} title="No results found" />}
                    </TabsContent>
                    <TabsContent value="services" className="space-y-2">
                      {filteredServices.length > 0 ? filteredServices.map(service => <ServiceCard key={service.id} service={service} onClick={() => navigate("/services")} />) : <EmptyState icon={Search} title="No results found" />}
                    </TabsContent>
                    <TabsContent value="transport" className="space-y-2">
                      {filteredTransport.length > 0 ? filteredTransport.map(route => <TransportCard key={route.id} route={route} onClick={() => navigate("/transport")} />) : <EmptyState icon={Search} title="No results found" />}
                    </TabsContent>
                    <TabsContent value="hashtags" className="space-y-2">
                      {filteredHashtags.length > 0 ? filteredHashtags.map(h => <HashtagCard key={h.id} hashtag={h} onClick={() => setSearchQuery(h.tag.replace("#", ""))} />) : <EmptyState icon={Search} title="No results found" />}
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-bold text-foreground">Recent Searches</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearAllRecent} className="text-xs text-muted-foreground">Clear all</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((q) => (
                      <div key={q} className="flex items-center gap-1 pl-3 pr-1 py-1.5 rounded-full bg-muted/70 text-sm">
                        <button className="text-foreground" onClick={() => runSearch(q)}>{q}</button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeRecentSearch(q)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Trending Searches</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((q) => (
                    <button key={q} onClick={() => runSearch(q)} className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted/70 hover:bg-muted text-foreground border border-border transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested Searches */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Suggested Searches</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SEARCHES.map((q) => (
                    <button key={q} onClick={() => runSearch(q)} className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted/70 hover:bg-muted text-foreground border border-border transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Chips */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Categories</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <motion.button
                      key={cat.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                        selectedCategory === cat.name
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/70 hover:bg-muted text-foreground border-border"
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <TrendingSection variant="full" />

              {/* Trending Posts */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-bold text-foreground">Trending Posts</h2>
                </div>
                {loadingTrending ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <Card key={i} className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-9 h-9 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-full" />
                      </Card>
                    ))}
                  </div>
                ) : trendingPosts.length > 0 ? (
                  <div className="space-y-3">
                    {trendingPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                      >
                        <LivePost {...post} is_trending />
                      </motion.div>
                    ))}
                  </div>
                ) : null}

                {/* Instagram-style trending image gallery */}
                <div className="mt-4">
                  <ExploreGallery
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                  />
                </div>
              </div>


              {/* People suggestions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Suggested Creators</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                  {mockPeople.map(person => <PersonCard key={person.id} person={person} onClick={() => navigate(`/user/${person.id}`)} />)}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

const SearchSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{title}</h3>
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

const PersonCard = ({ person, onClick }: { person: typeof mockPeople[0]; onClick?: () => void }) => (
  <Card className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/40 transition-colors" onClick={onClick}>
    <Avatar className="w-12 h-12">
      <AvatarImage src={person.avatar} />
      <AvatarFallback>{person.name[0]}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm text-foreground truncate">{person.name}</p>
      <p className="text-xs text-muted-foreground">{person.username}</p>
      <p className="text-xs text-muted-foreground">{person.mutualFriends} mutual friends</p>
    </div>
    <Button size="sm" variant="outline" className="shrink-0" onClick={(e) => e.stopPropagation()}>Follow</Button>
  </Card>
);

const PostCard = ({ post, onClick }: { post: typeof mockPosts[0]; onClick?: () => void }) => (
  <Card className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/40 transition-colors" onClick={onClick}>
    <Avatar className="w-10 h-10 shrink-0">
      <AvatarImage src={post.avatar} />
      <AvatarFallback>{post.author[0]}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm text-foreground truncate">{post.author}</p>
      <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
    </div>
    {post.image && (
      <img src={post.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
    )}
  </Card>
);

const ServiceCard = ({ service, onClick }: { service: typeof mockServices[0]; onClick?: () => void }) => (
  <Card className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/40 transition-colors" onClick={onClick}>
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Layers className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm text-foreground truncate">{service.name}</p>
      <p className="text-xs text-muted-foreground">{service.category} · ⭐ {service.rating}</p>
    </div>
    <Badge variant="secondary" className="shrink-0">{service.price}</Badge>
  </Card>
);

const TransportCard = ({ route, onClick }: { route: typeof mockTransport[0]; onClick?: () => void }) => (
  <Card className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/40 transition-colors" onClick={onClick}>
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Car className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm text-foreground truncate">{route.route}</p>
      <p className="text-xs text-muted-foreground">{route.type} · ETA {route.eta}</p>
    </div>
    <Badge variant="secondary" className="shrink-0">{route.price}</Badge>
  </Card>
);

const HashtagCard = ({ hashtag, onClick }: { hashtag: typeof mockHashtags[0]; onClick?: () => void }) => (
  <Card className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/40 transition-colors" onClick={onClick}>
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <AtSign className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm text-foreground truncate">{hashtag.tag}</p>
      <p className="text-xs text-muted-foreground">{hashtag.posts} posts</p>
    </div>
  </Card>
);

export default Explore;
