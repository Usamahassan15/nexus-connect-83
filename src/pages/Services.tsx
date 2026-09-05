import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Handshake, Search, MapPin, Star, Clock, MessageCircle, Plus, ImagePlus, FolderKanban, Heart, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import TopBar from "@/components/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import ServiceProjectsBidding from "@/components/ServiceProjectsBidding";
import ServiceProviderProfile from "@/components/ServiceProviderProfile";
import ServiceAuthDialog from "@/components/ServiceAuthDialog";
import { chatPath } from "@/lib/socialGraph";
import ServiceBookingFlow from "@/components/ServiceBookingFlow";
import { EmptyState } from "@/components/ui/empty-state";

const digitalServices = [
  {
    id: 101,
    title: "Web Development",
    description: "Full-stack web development services. React, Node.js, and modern web technologies. Portfolio available.",
    provider: "Alex Chen",
    providerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    location: "Remote",
    category: "Technology",
    price: "$75/hr",
    rating: 4.8,
    reviews: 89,
    responseTime: "Usually responds within 2 hours",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
  },
  {
    id: 102,
    title: "Logo & Brand Design",
    description: "Creative logo and brand identity design. Modern, minimal, and memorable designs delivered fast.",
    provider: "Emma Davis",
    providerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    location: "Remote",
    category: "Creative",
    price: "$45/hr",
    rating: 4.9,
    reviews: 215,
    responseTime: "Usually responds within 1 hour",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop",
  },
  {
    id: 103,
    title: "SEO & Digital Marketing",
    description: "Boost your online presence with expert SEO, content marketing, and social media strategy.",
    provider: "James Wilson",
    providerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    location: "Remote",
    category: "Marketing",
    price: "$60/hr",
    rating: 4.7,
    reviews: 142,
    responseTime: "Usually responds within 3 hours",
    image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=300&fit=crop",
  },
  {
    id: 104,
    title: "Video Editing",
    description: "Professional video editing for YouTube, social media, and commercials. Quick turnaround.",
    provider: "Sophie Martin",
    providerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
    location: "Remote",
    category: "Creative",
    price: "$55/hr",
    rating: 4.8,
    reviews: 178,
    responseTime: "Usually responds within 2 hours",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
  },
];

const physicalServices = [
  {
    id: 1,
    title: "Home Cleaning",
    description: "Professional home cleaning services. Deep cleaning, regular maintenance, and move-out cleaning available.",
    provider: "Maria Garcia",
    providerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    location: "San Francisco, CA",
    category: "Home Services",
    price: "$50/hr",
    rating: 4.9,
    reviews: 128,
    responseTime: "Usually responds within 1 hour",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Plumbing Services",
    description: "Expert plumbing repair and installation. Available 24/7 for emergencies. Licensed and insured.",
    provider: "Robert Brown",
    providerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    location: "Chicago, IL",
    category: "Home Services",
    price: "$80/hr",
    rating: 4.8,
    reviews: 94,
    responseTime: "Usually responds within 30 mins",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Personal Training",
    description: "Certified personal trainer offering customized workout plans and nutrition guidance. In-person sessions.",
    provider: "Mike Johnson",
    providerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    location: "Los Angeles, CA",
    category: "Fitness",
    price: "$60/hr",
    rating: 4.7,
    reviews: 156,
    responseTime: "Usually responds within 30 mins",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    title: "Photography",
    description: "Professional photography for events, portraits, and commercial projects. High-quality equipment and editing.",
    provider: "Sarah Williams",
    providerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahW",
    location: "New York, NY",
    category: "Creative",
    price: "$100/hr",
    rating: 4.9,
    reviews: 203,
    responseTime: "Usually responds within 3 hours",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=300&fit=crop",
  },
];

const categories = ["All Categories", "Home Services", "Technology", "Fitness", "Creative", "Education", "Beauty", "Automotive", "Legal", "Financial"];

export default function Services() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceType, setServiceType] = useState<"digital" | "physical">("digital");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showPostDialog, setShowPostDialog] = useState(false);
  const initialOpenProjects = searchParams.get("openProjects") === "1";
  const [showProjectsBidding, setShowProjectsBidding] = useState(initialOpenProjects);
  const [projectsBiddingTab, setProjectsBiddingTab] = useState<"projects" | "bidding">("projects");

  useEffect(() => {
    if (searchParams.get("openProjects") === "1") {
      setProjectsBiddingTab("projects");
      setShowProjectsBidding(true);
    }
  }, [searchParams]);
  const services = (serviceType === "digital" ? digitalServices : physicalServices).filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const [serviceImages, setServiceImages] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<typeof digitalServices[0] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newService, setNewService] = useState({ title: "", description: "", category: "", price: "", location: "" });
  const [likedServices, setLikedServices] = useState<Set<number>>(new Set());
  const [bookingService, setBookingService] = useState<typeof digitalServices[0] | null>(null);

  const toggleLike = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLikedServices(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result && serviceImages.length < 3) {
            setServiceImages((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handlePostService = () => {
    if (newService.title && newService.description && newService.category) {
      toast({ title: "Service posted successfully!" });
      setShowPostDialog(false);
      setNewService({ title: "", description: "", category: "", price: "", location: "" });
      setServiceImages([]);
    }
  };

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);

  const handleContact = (providerName: string) => {
    const auth = localStorage.getItem("service_auth");
    if (!auth) {
      setPendingProvider(providerName);
      setSelectedService(null);
      setShowAuthDialog(true);
      return;
    }
    setSelectedService(null);
    navigate(chatPath(providerName));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <TopBar />

      <main className="flex-1 pb-16 md:pb-8 pt-14 md:pt-14">
        <div className="w-full max-w-[100vw] mx-auto px-0 sm:px-4 md:px-3 lg:px-6 pt-0 md:pt-6 overflow-x-hidden lg:max-w-[980px] xl:max-w-[1040px]">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 sm:mb-5 md:mb-6 px-3 sm:px-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 mb-1 sm:mb-2">
                <Handshake className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Services</h1>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" className="gap-2 hidden md:inline-flex" onClick={() => navigate("/services/dashboard")}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </div>
            </div>
            {/* Digital / Physical Toggle */}
            <div className="flex items-center gap-2 mt-3 mb-2">
              <Button
                size="sm"
                variant={serviceType === "digital" ? "default" : "outline"}
                className={`rounded-full text-xs sm:text-sm ${serviceType === "digital" ? "bg-gradient-to-r from-primary to-primary/80" : ""}`}
                onClick={() => setServiceType("digital")}
              >
                Digital Services
              </Button>
              <Button
                size="sm"
                variant={serviceType === "physical" ? "default" : "outline"}
                className={`rounded-full text-xs sm:text-sm ${serviceType === "physical" ? "bg-gradient-to-r from-primary to-primary/80" : ""}`}
                onClick={() => setServiceType("physical")}
              >
                Physical Services
              </Button>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">Find and offer services in your community</p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4 sm:mb-6 space-y-3 px-3 sm:px-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input placeholder="Search services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 sm:pl-10 h-10 sm:h-12 rounded-lg text-sm sm:text-base" />
              </div>
              <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
                <DialogTrigger asChild>
                  <Button className="h-10 sm:h-12 px-3 sm:px-4 md:px-6 flex-shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-lg font-semibold">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:mr-2" />
                    <span className="hidden md:inline">Post Service</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Post Your Service</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label className="mb-2 block">Add Images (up to 3)</Label>
                      <div className="flex gap-2">
                        {serviceImages.map((img, index) => (
                          <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => setServiceImages((prev) => prev.filter((_, i) => i !== index))} className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs">×</button>
                          </div>
                        ))}
                        {serviceImages.length < 3 && (
                          <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors">
                            <ImagePlus className="w-5 h-5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">Add</span>
                          </button>
                        )}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    </div>
                    <div><Label htmlFor="title">Service Title</Label><Input id="title" placeholder="e.g., Home Cleaning" value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} /></div>
                    <div><Label htmlFor="category">Category</Label><Select value={newService.category} onValueChange={(value) => setNewService({ ...newService, category: value })}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.slice(1).map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select></div>
                    <div><Label htmlFor="price">Price</Label><Input id="price" placeholder="e.g., $50/hr" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} /></div>
                    <div><Label htmlFor="location">Location</Label><Input id="location" placeholder="e.g., San Francisco, CA or Remote" value={newService.location} onChange={(e) => setNewService({ ...newService, location: e.target.value })} /></div>
                    <div><Label htmlFor="description">Description</Label><Textarea id="description" placeholder="Describe your service..." value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} rows={4} /></div>
                    <Button className="w-full" onClick={handlePostService}>Post Service</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (<Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" className="flex-shrink-0 rounded-full text-xs sm:text-sm" onClick={() => setSelectedCategory(cat)}>{cat === "All Categories" ? "All" : cat}</Button>))}
            </div>

            {/* Google Map - Physical Services only */}
                      </motion.div>

          {services.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No services found"
              description="Try adjusting your search or filters to find what you are looking for."
              actionLabel="Clear filters"
              onAction={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
              }}
            />
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 px-1 sm:px-0">
            {services.map((service, index) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }}>
                {/* Mobile: horizontal narrow card */}
                <Card
                  className="sm:hidden overflow-hidden hover:shadow-md transition-all rounded-xl border border-border/40 cursor-pointer relative"
                  onClick={() => setSelectedService(service)}
                >
                  <button
                    onClick={(e) => toggleLike(e, service.id)}
                    className="absolute top-1.5 right-1.5 z-10 p-1 rounded-full bg-background/70 backdrop-blur-sm"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${likedServices.has(service.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
                    />
                  </button>
                  <div className="flex">
                    <div className="w-28 h-24 flex-shrink-0 overflow-hidden bg-muted">
                      <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                    </div>
                    <CardContent className="flex-1 p-2.5 flex flex-col justify-between min-w-0">
                      <div>
                        <h3 className="font-semibold text-sm text-foreground line-clamp-1 pr-6">{service.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex items-center gap-0.5 text-yellow-500">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-medium text-foreground">{service.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">({service.reviews})</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground self-end">From <span className="font-bold text-primary">{service.price}</span></p>
                    </CardContent>
                  </div>
                </Card>

                {/* Desktop/Tablet: horizontal fiverr-style card */}
                <Card
                  className="hidden sm:block overflow-hidden hover:shadow-lg transition-all rounded-xl border border-border/50 cursor-pointer"
                  onClick={() => setSelectedService(service)}
                >
                  <div className="relative aspect-[4/2.5] overflow-hidden bg-muted w-full">
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    <button
                      onClick={(e) => toggleLike(e, service.id)}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${likedServices.has(service.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
                      />
                    </button>
                  </div>
                  <CardContent className="p-2.5 md:p-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Avatar className="w-5 h-5"><AvatarImage src={service.providerAvatar} /><AvatarFallback className="text-[10px]">{service.provider[0]}</AvatarFallback></Avatar>
                        <span className="text-xs text-muted-foreground font-medium">{service.provider}</span>
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-auto">{service.category}</Badge>
                      </div>
                      <h3 className="font-semibold text-sm text-foreground line-clamp-1 leading-tight">{service.title}</h3>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-medium">{service.rating}</span>
                        <span className="text-xs text-muted-foreground">({service.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <p className="font-bold text-primary text-sm">From {service.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </main>

      <MobileNav />
      <ServiceProjectsBidding isOpen={showProjectsBidding} onClose={() => { setShowProjectsBidding(false); if (searchParams.get("openProjects")) { searchParams.delete("openProjects"); setSearchParams(searchParams, { replace: true }); } }} initialTab={projectsBiddingTab} />
      <ServiceProviderProfile service={selectedService} isOpen={!!selectedService} onClose={() => setSelectedService(null)} onContact={handleContact} onBook={() => { if (selectedService) { setBookingService(selectedService); setSelectedService(null); } }} />
      <ServiceBookingFlow service={bookingService} open={!!bookingService} onOpenChange={(open) => { if (!open) setBookingService(null); }} onMessage={() => { setBookingService(null); navigate("/messages"); }} />
      <ServiceAuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} onAuthComplete={() => { if (pendingProvider) { navigate(chatPath(pendingProvider)); setPendingProvider(null); } }} />
    </div>
  );
}
