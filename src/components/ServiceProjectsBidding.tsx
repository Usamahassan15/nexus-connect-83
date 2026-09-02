import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronUp, ChevronDown, Clock, DollarSign, User, Send, Star,
  Calendar, Briefcase, Award, Search, SlidersHorizontal, Layers, TrendingUp, FileText,
  MapPin, Globe, Timer, Wrench, Languages, X, Plus, Paperclip, Bookmark,
  BookmarkCheck, Eye, SortAsc, Share2, Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";

// Types
interface Project {
  id: number;
  title: string;
  description: string;
  budget: string;
  budgetType: "Fixed" | "Hourly";
  deadline: string;
  duration: string;
  skills: string[];
  client: string;
  clientAvatar: string;
  clientRating: number;
  clientJobs: number;
  postedDate: string;
  proposals: number;
  category: string;
  experienceLevel: string;
  visibility: "Public" | "Private";
  isOwn?: boolean;
}

interface Bid {
  id: number;
  freelancer: string;
  avatar: string;
  amount: string;
  deliveryTime: string;
  proposal: string;
  rating: number;
  completedJobs: number;
  score: number;
  status: "Pending" | "Accepted" | "Rejected";
  projectId: number;
  projectTitle: string;
}

// Mock data
const mockProjects: Project[] = [
  {
    id: 1, title: "E-commerce Website Development",
    description: "Looking for an experienced developer to build a modern e-commerce platform with React and Node.js. Must include payment integration, inventory management, and admin dashboard.",
    budget: "$2,000 - $5,000", budgetType: "Fixed", deadline: "Apr 15, 2026", duration: "1-3 months",
    skills: ["React", "Node.js", "MongoDB", "Stripe"],
    client: "Tech Solutions Inc.", clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechSol",
    clientRating: 4.8, clientJobs: 23, postedDate: "2 hours ago", proposals: 12,
    category: "Web Development", experienceLevel: "Expert", visibility: "Public",
  },
  {
    id: 2, title: "Mobile App UI/UX Design",
    description: "Need a talented designer to create UI/UX for a fitness tracking mobile app. Modern, clean, and user-friendly design required.",
    budget: "$800 - $1,500", budgetType: "Fixed", deadline: "Mar 20, 2026", duration: "Less than 1 month",
    skills: ["Figma", "UI Design", "Mobile Design", "Prototyping"],
    client: "FitLife App", clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=FitLife",
    clientRating: 4.6, clientJobs: 8, postedDate: "5 hours ago", proposals: 8,
    category: "Design", experienceLevel: "Intermediate", visibility: "Public",
  },
  {
    id: 3, title: "Content Writing for Tech Blog",
    description: "Seeking experienced tech writers for ongoing blog content. Topics include AI, cloud computing, and software development.",
    budget: "$50 - $100/hr", budgetType: "Hourly", deadline: "Ongoing", duration: "More than 6 months",
    skills: ["Content Writing", "SEO", "Tech Knowledge", "Research"],
    client: "Digital Trends Media", clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DTMedia",
    clientRating: 4.9, clientJobs: 45, postedDate: "1 day ago", proposals: 25,
    category: "Writing", experienceLevel: "Entry Level", visibility: "Public",
  },
  {
    id: 4, title: "Marketing Campaign Strategy",
    description: "Need a marketing expert to plan and execute a comprehensive digital marketing campaign for our SaaS product launch.",
    budget: "$3,000 - $6,000", budgetType: "Fixed", deadline: "May 1, 2026", duration: "1-3 months",
    skills: ["Digital Marketing", "SEO", "Social Media", "Analytics"],
    client: "LaunchPad SaaS", clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=LaunchPad",
    clientRating: 4.7, clientJobs: 15, postedDate: "3 hours ago", proposals: 6,
    category: "Marketing", experienceLevel: "Expert", visibility: "Public",
  },
];

const myPostedProjects: Project[] = [
  {
    id: 100, title: "Build a Portfolio Website",
    description: "Looking for a developer to create a modern portfolio website with animations and CMS integration.",
    budget: "$500 - $1,000", budgetType: "Fixed", deadline: "Mar 25, 2026", duration: "Less than 1 month",
    skills: ["React", "Tailwind CSS", "CMS"],
    client: "You", clientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
    clientRating: 5.0, clientJobs: 3, postedDate: "1 day ago", proposals: 4,
    category: "Web Development", experienceLevel: "Intermediate", visibility: "Public", isOwn: true,
  },
];

const myBids: Bid[] = [
  { id: 1, freelancer: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You", amount: "$3,200", deliveryTime: "20 days", proposal: "I have extensive experience building e-commerce platforms...", rating: 4.9, completedJobs: 45, score: 0, status: "Pending", projectId: 1, projectTitle: "E-commerce Website Development" },
  { id: 2, freelancer: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You", amount: "$900", deliveryTime: "10 days", proposal: "Expert UI/UX designer with 5+ years in mobile apps...", rating: 4.9, completedJobs: 45, score: 0, status: "Accepted", projectId: 2, projectTitle: "Mobile App UI/UX Design" },
  { id: 3, freelancer: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You", amount: "$70/hr", deliveryTime: "Ongoing", proposal: "Experienced tech writer with published articles...", rating: 4.9, completedJobs: 45, score: 0, status: "Rejected", projectId: 3, projectTitle: "Content Writing for Tech Blog" },
];

const projectBids: Bid[] = [
  { id: 10, freelancer: "Alex Developer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AlexDev", amount: "$3,500", deliveryTime: "25 days", proposal: "I have 5+ years of experience building e-commerce platforms.", rating: 4.9, completedJobs: 87, score: 42, status: "Pending", projectId: 1, projectTitle: "" },
  { id: 11, freelancer: "Sarah Coder", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahC", amount: "$4,200", deliveryTime: "28 days", proposal: "Expert in React and e-commerce solutions. Portfolio includes multiple successful projects.", rating: 4.8, completedJobs: 65, score: 28, status: "Pending", projectId: 1, projectTitle: "" },
  { id: 12, freelancer: "Mike Builder", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MikeB", amount: "$2,800", deliveryTime: "30 days", proposal: "Full-stack developer with Stripe integration expertise.", rating: 4.7, completedJobs: 42, score: 15, status: "Pending", projectId: 1, projectTitle: "" },
];

const filterOptions = {
  category: ["Web Development", "Mobile Development", "Design", "Writing", "Marketing", "Data Science", "Video & Animation"],
  experienceLevel: ["Entry Level", "Intermediate", "Expert"],
  budgetType: ["Fixed", "Hourly"],
  projectLength: ["Less than 1 month", "1-3 months", "3-6 months", "More than 6 months"],
};

interface ServiceProjectsBiddingProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "projects" | "bidding";
}

export default function ServiceProjectsBidding({ isOpen, onClose, initialTab = "projects" }: ServiceProjectsBiddingProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showPostProjectModal, setShowPostProjectModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [savedProjects, setSavedProjects] = useState<Set<number>>(new Set());
  const [bids, setBids] = useState<Bid[]>(projectBids);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const proposalFileRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState({
    category: "", experienceLevel: "", budgetType: "", projectLength: "",
  });

  const [newProject, setNewProject] = useState({
    title: "", category: "", budgetType: "Fixed", budgetMin: "", budgetMax: "",
    duration: "", experienceLevel: "", skills: [] as string[], skillInput: "",
    description: "", deadline: "", visibility: "Public",
  });

  const [proposalForm, setProposalForm] = useState({
    message: "", bidAmount: "", deliveryTime: "", attachmentName: "",
  });

  // Filtered & sorted projects
  const filteredProjects = useMemo(() => {
    let result = [...mockProjects];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (filters.category) result = result.filter(p => p.category === filters.category);
    if (filters.experienceLevel) result = result.filter(p => p.experienceLevel === filters.experienceLevel);
    if (filters.budgetType) result = result.filter(p => p.budgetType === filters.budgetType);

    if (sortBy === "newest") result.sort((a, b) => a.id - b.id);
    else if (sortBy === "budget-high") result.sort((a, b) => {
      const getMax = (s: string) => parseInt(s.replace(/[^0-9]/g, "")) || 0;
      return getMax(b.budget) - getMax(a.budget);
    });
    else if (sortBy === "budget-low") result.sort((a, b) => {
      const getMax = (s: string) => parseInt(s.replace(/[^0-9]/g, "")) || 0;
      return getMax(a.budget) - getMax(b.budget);
    });
    return result;
  }, [searchQuery, filters, sortBy]);

  const clearFilters = () => setFilters({ category: "", experienceLevel: "", budgetType: "", projectLength: "" });

  const toggleSave = (id: number) => {
    setSavedProjects(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddSkill = () => {
    const skill = newProject.skillInput.trim();
    if (skill && !newProject.skills.includes(skill)) {
      setNewProject(p => ({ ...p, skills: [...p.skills, skill], skillInput: "" }));
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setNewProject(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  };

  const handlePublishProject = (draft = false) => {
    if (!newProject.title || !newProject.description || !newProject.category) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    toast({ title: draft ? "Project saved as draft!" : "Project published successfully!" });
    setShowPostProjectModal(false);
    setNewProject({ title: "", category: "", budgetType: "Fixed", budgetMin: "", budgetMax: "", duration: "", experienceLevel: "", skills: [], skillInput: "", description: "", deadline: "", visibility: "Public" });
  };

  const handleSubmitProposal = () => {
    if (!proposalForm.message || !proposalForm.bidAmount || !proposalForm.deliveryTime) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    toast({ title: "Proposal submitted successfully!" });
    setShowProposalModal(false);
    setProposalForm({ message: "", bidAmount: "", deliveryTime: "", attachmentName: "" });
  };

  const handleVote = (bidId: number, direction: "up" | "down") => {
    setBids(prev => prev.map(b => b.id === bidId ? { ...b, score: b.score + (direction === "up" ? 1 : -1) } : b).sort((a, b) => b.score - a.score));
  };

  const statusColor = (s: string) => s === "Accepted" ? "bg-green-500/10 text-green-600 border-green-500/20" : s === "Rejected" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";

  // Filters sidebar content
  const FiltersContent = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-primary">Clear all</Button>
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium"><Layers className="w-4 h-4 text-muted-foreground" />Category</Label>
        <Select value={filters.category} onValueChange={v => setFilters({ ...filters, category: v })}>
          <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>{filterOptions.category.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium"><TrendingUp className="w-4 h-4 text-muted-foreground" />Experience Level</Label>
        <Select value={filters.experienceLevel} onValueChange={v => setFilters({ ...filters, experienceLevel: v })}>
          <SelectTrigger><SelectValue placeholder="All levels" /></SelectTrigger>
          <SelectContent>{filterOptions.experienceLevel.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium"><DollarSign className="w-4 h-4 text-muted-foreground" />Budget Type</Label>
        <Select value={filters.budgetType} onValueChange={v => setFilters({ ...filters, budgetType: v })}>
          <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>{filterOptions.budgetType.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium"><Timer className="w-4 h-4 text-muted-foreground" />Project Length</Label>
        <Select value={filters.projectLength} onValueChange={v => setFilters({ ...filters, projectLength: v })}>
          <SelectTrigger><SelectValue placeholder="Any duration" /></SelectTrigger>
          <SelectContent>{filterOptions.projectLength.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );

  const openProject = (p: Project) => setSelectedProject(p);

  const avgBid = useMemo(() => {
    const nums = bids.map(b => parseInt(b.amount.replace(/[^0-9]/g, "")) || 0).filter(Boolean);
    if (!nums.length) return "—";
    return `£${Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)} GBP`;
  }, [bids]);

  const shareProject = async (project: Project) => {
    const url = `${window.location.origin}/services?project=${project.id}`;
    try {
      if (navigator.share) await navigator.share({ title: project.title, text: project.description, url });
      else { await navigator.clipboard.writeText(url); toast({ title: "Project link copied" }); }
    } catch { /* dismissed */ }
  };

  // Project card component
  const ProjectCard = ({ project, showProposal = false }: { project: Project; showProposal?: boolean }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-all border-border/50">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
            <AvatarImage src={project.clientAvatar} />
            <AvatarFallback>{project.client[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">{project.category}</Badge>
                  <Badge variant="outline" className="text-xs">{project.experienceLevel}</Badge>
                </div>
                <h3 className="font-semibold text-foreground line-clamp-1 text-sm sm:text-base" onClick={() => openProject(project)}>{project.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{project.client} · {project.postedDate}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={(e) => { e.stopPropagation(); toggleSave(project.id); }} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                  {savedProjects.has(project.id)
                    ? <BookmarkCheck className="w-4 h-4 text-primary" />
                    : <Bookmark className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5">{project.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {project.skills.slice(0, 4).map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
              {project.skills.length > 4 && <Badge variant="outline" className="text-xs">+{project.skills.length - 4}</Badge>}
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="font-bold text-primary text-sm">{project.budget}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{project.duration}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{project.proposals} bids</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); openProject(project); }}>
                  <Eye className="w-3 h-3 mr-1" />Details
                </Button>
                {showProposal && (
                  <Button size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); openProject(project); }}>
                    <Send className="w-3 h-3 mr-1" />Propose
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-border flex items-center gap-3 bg-card">
          <Button variant="ghost" size="icon" onClick={selectedProject ? () => setSelectedProject(null) : onClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-base sm:text-lg font-bold flex-1 truncate">
            {selectedProject ? selectedProject.title : "Projects & Bidding"}
          </h1>
          {!selectedProject && (
            <Button size="sm" className="gap-1.5 bg-gradient-to-r from-primary to-primary/80" onClick={() => setShowPostProjectModal(true)}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Post a Project</span>
            </Button>
          )}
        </div>

        {/* Main tabs */}
        {!selectedProject ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent px-3 sm:px-4">
                {[
                  { value: "projects", label: "All Projects", count: filteredProjects.length },
                  { value: "bidding", label: "Bidding", count: filteredProjects.length },
                  { value: "my-posts", label: "My Posts", count: myPostedProjects.length },
                  { value: "my-bids", label: "My Bids", count: myBids.length },
                  { value: "saved", label: "Saved", count: savedProjects.size },
                ].map(t => (
                  <TabsTrigger key={t.value} value={t.value} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs sm:text-sm px-2 sm:px-4 py-2.5">
                    {t.label}
                    <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 h-4">{t.count}</Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Search + Sort bar (shared for projects & bidding) */}
              {(activeTab === "projects" || activeTab === "bidding") && (
                <div className="p-3 sm:p-4 border-b border-border bg-card/30">
                  <div className="flex gap-2 max-w-4xl mx-auto">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search projects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-9 sm:h-10" />
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[140px] sm:w-[160px] h-9 sm:h-10">
                        <SortAsc className="w-3.5 h-3.5 mr-1" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="budget-high">Budget High→Low</SelectItem>
                        <SelectItem value="budget-low">Budget Low→High</SelectItem>
                      </SelectContent>
                    </Select>
                    <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="lg:hidden h-9 sm:h-10 px-3 gap-2 flex-shrink-0 hover:bg-accent/60 transition-colors min-w-[40px]">
                          <SlidersHorizontal className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium hidden sm:inline">Filter</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-[85vw] sm:w-[380px] p-0">
                        <SheetHeader className="p-4 border-b border-border"><SheetTitle>Filter Projects</SheetTitle></SheetHeader>
                        <ScrollArea className="h-[calc(100vh-60px)]"><div className="p-4"><FiltersContent /></div></ScrollArea>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              )}

              <div className="flex-1 flex overflow-hidden">
                {/* Desktop Filters (only for projects/bidding tabs) */}
                {(activeTab === "projects" || activeTab === "bidding") && (
                  <aside className="hidden lg:block w-64 xl:w-72 border-r border-border bg-card/50 overflow-y-auto">
                    <ScrollArea className="h-full"><div className="p-4"><FiltersContent /></div></ScrollArea>
                  </aside>
                )}

                <div className="flex-1 overflow-y-auto">
                  {/* All Projects */}
                  <TabsContent value="projects" className="mt-0 p-3 sm:p-4 space-y-3 max-w-4xl mx-auto">
                    {filteredProjects.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">No projects found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                      </div>
                    ) : filteredProjects.map((p, i) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <ProjectCard project={p} />
                      </motion.div>
                    ))}
                  </TabsContent>

                  {/* Bidding */}
                  <TabsContent value="bidding" className="mt-0 p-3 sm:p-4 space-y-3 max-w-4xl mx-auto">
                    {filteredProjects.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">No projects available</p>
                      </div>
                    ) : filteredProjects.map((p, i) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <ProjectCard project={p} showProposal />
                      </motion.div>
                    ))}
                  </TabsContent>

                  {/* My Posts */}
                  <TabsContent value="my-posts" className="mt-0 p-3 sm:p-4 space-y-3 max-w-4xl mx-auto">
                    {myPostedProjects.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">No posted projects yet</p>
                        <Button className="mt-3" onClick={() => setShowPostProjectModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />Post Your First Project
                        </Button>
                      </div>
                    ) : myPostedProjects.map(p => (
                      <Card key={p.id} className="border-border/50">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground">{p.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{p.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="font-bold text-primary">{p.budget}</span>
                                <span>{p.proposals} proposals</span>
                                <span>{p.postedDate}</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="h-7 text-xs flex-shrink-0" onClick={() => setSelectedProject(p)}>
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  {/* My Bids */}
                  <TabsContent value="my-bids" className="mt-0 p-3 sm:p-4 space-y-3 max-w-4xl mx-auto">
                    {myBids.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <Send className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">No bids submitted yet</p>
                        <p className="text-sm mt-1">Browse projects and submit proposals</p>
                      </div>
                    ) : myBids.map(bid => (
                      <Card key={bid.id} className="border-border/50">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground text-sm sm:text-base">{bid.projectTitle}</h3>
                                <Badge className={`text-xs border ${statusColor(bid.status)}`}>{bid.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">{bid.proposal}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="font-bold text-primary">{bid.amount}</span>
                                <span>Delivery: {bid.deliveryTime}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  {/* Saved */}
                  <TabsContent value="saved" className="mt-0 p-3 sm:p-4 space-y-3 max-w-4xl mx-auto">
                    {savedProjects.size === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">No saved projects</p>
                        <p className="text-sm mt-1">Bookmark projects to save them here</p>
                      </div>
                    ) : mockProjects.filter(p => savedProjects.has(p.id)).map(p => (
                      <ProjectCard key={p.id} project={p} />
                    ))}
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        ) : (
          /* Project Detail View */
          <ScrollArea className="flex-1">
            <div className="max-w-4xl mx-auto p-3 sm:p-4">
              {/* Title + top stats */}
              <div className="mb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{selectedProject.category}</Badge>
                      <Badge variant="outline" className="text-xs">{selectedProject.experienceLevel}</Badge>
                      <Badge variant="outline" className="text-xs">{selectedProject.budgetType}</Badge>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">{selectedProject.title}</h2>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Posted {selectedProject.postedDate} · {selectedProject.budget}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => toggleSave(selectedProject.id)} aria-label="Save project" className="p-2 rounded-md hover:bg-muted">
                      {savedProjects.has(selectedProject.id)
                        ? <BookmarkCheck className="w-5 h-5 text-primary" />
                        : <Bookmark className="w-5 h-5 text-muted-foreground" />}
                    </button>
                    <button onClick={() => shareProject(selectedProject)} aria-label="Share project" className="p-2 rounded-md hover:bg-muted">
                      <Share2 className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">Total Bids</p>
                    <p className="text-xl font-bold text-foreground">{selectedProject.proposals}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">Average bid</p>
                    <p className="text-xl font-bold text-primary">{avgBid}</p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                  <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Details</TabsTrigger>
                  <TabsTrigger value="bids" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Proposals ({bids.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 pt-4">
                  {/* Project Details */}
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Project Description</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedProject.description}</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { icon: DollarSign, label: "Budget", value: selectedProject.budget },
                          { icon: Clock, label: "Duration", value: selectedProject.duration },
                          { icon: Calendar, label: "Deadline", value: selectedProject.deadline },
                          { icon: Award, label: "Experience", value: selectedProject.experienceLevel },
                        ].map(item => (
                          <div key={item.label} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                            <item.icon className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-[11px] text-muted-foreground">{item.label}</p>
                              <p className="text-sm font-semibold">{item.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Skills Required</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.skills.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* About the Client */}
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">About the Client</h3>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={selectedProject.clientAvatar} />
                          <AvatarFallback>{selectedProject.client[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{selectedProject.client}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1 text-yellow-500"><Star className="w-3 h-3 fill-current" /><span className="text-xs text-foreground">{selectedProject.clientRating}</span></span>
                            <span>·</span>
                            <span className="text-xs">{selectedProject.clientJobs} projects posted</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <p className="text-[11px] text-muted-foreground">Member since</p>
                          <p className="text-sm font-semibold">2023</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <p className="text-[11px] text-muted-foreground">Payment</p>
                          <p className="text-sm font-semibold">Verified</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <p className="text-[11px] text-muted-foreground">Hire rate</p>
                          <p className="text-sm font-semibold">86%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Place a bid */}
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold">Place a bid on this project</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Bid amount</Label>
                          <Input placeholder="e.g., 150" value={proposalForm.bidAmount} onChange={e => setProposalForm({ ...proposalForm, bidAmount: e.target.value })} className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">Delivery time</Label>
                          <Input placeholder="e.g., 14 days" value={proposalForm.deliveryTime} onChange={e => setProposalForm({ ...proposalForm, deliveryTime: e.target.value })} className="mt-1" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Describe your proposal</Label>
                        <Textarea rows={3} placeholder="Why are you the best fit for this project?" value={proposalForm.message} onChange={e => setProposalForm({ ...proposalForm, message: e.target.value })} className="mt-1" />
                      </div>
                      <Button className="w-full" onClick={handleSubmitProposal}>
                        <Send className="w-4 h-4 mr-2" />Place Bid
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="bids" className="space-y-3 pt-4">
                  {bids.map(bid => (
                    <motion.div key={bid.id} layout>
                      <Card>
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex gap-2 sm:gap-3">
                            <div className="flex flex-col items-center gap-0.5">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleVote(bid.id, "up")}><ChevronUp className="w-4 h-4" /></Button>
                              <span className="font-bold text-xs">{bid.score}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleVote(bid.id, "down")}><ChevronDown className="w-4 h-4" /></Button>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 sm:gap-3">
                                <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                                  <AvatarImage src={bid.avatar} />
                                  <AvatarFallback>{bid.freelancer[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-semibold text-sm">{bid.freelancer}</h4>
                                    <div className="flex items-center gap-0.5 text-yellow-500"><Star className="w-3 h-3 fill-current" /><span className="text-xs">{bid.rating}</span></div>
                                    <Badge variant="outline" className="text-xs"><Briefcase className="w-3 h-3 mr-1" />{bid.completedJobs} jobs</Badge>
                                  </div>
                                  <div className="flex gap-3 mt-1 text-sm">
                                    <span className="font-bold text-primary">{bid.amount}</span>
                                    <span className="text-muted-foreground">in {bid.deliveryTime}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1.5">{bid.proposal}</p>
                                  <button
                                    onClick={() => toast({ title: "Bid reported", description: "Thanks, our team will review this proposal." })}
                                    className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                                  >
                                    <Flag className="w-3.5 h-3.5" /> Report Bid
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

        )}
      </div>

      {/* Post Project Modal */}
      <Dialog open={showPostProjectModal} onOpenChange={setShowPostProjectModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Post a Project</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Project Title <span className="text-destructive">*</span></Label>
              <Input placeholder="e.g., Build an E-commerce Platform" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Category <span className="text-destructive">*</span></Label>
              <Select value={newProject.category} onValueChange={v => setNewProject({ ...newProject, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{filterOptions.category.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Budget Type</Label>
                <Select value={newProject.budgetType} onValueChange={v => setNewProject({ ...newProject, budgetType: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed">Fixed Price</SelectItem>
                    <SelectItem value="Hourly">Hourly Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Experience Level</Label>
                <Select value={newProject.experienceLevel} onValueChange={v => setNewProject({ ...newProject, experienceLevel: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{filterOptions.experienceLevel.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Budget Min ($)</Label>
                <Input placeholder="500" value={newProject.budgetMin} onChange={e => setNewProject({ ...newProject, budgetMin: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Budget Max ($)</Label>
                <Input placeholder="2000" value={newProject.budgetMax} onChange={e => setNewProject({ ...newProject, budgetMax: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duration</Label>
                <Select value={newProject.duration} onValueChange={v => setNewProject({ ...newProject, duration: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{filterOptions.projectLength.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Deadline</Label>
                <Input type="date" value={newProject.deadline} onChange={e => setNewProject({ ...newProject, deadline: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Required Skills</Label>
              <div className="flex gap-2 mt-1">
                <Input placeholder="Add a skill" value={newProject.skillInput} onChange={e => setNewProject({ ...newProject, skillInput: e.target.value })} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddSkill())} />
                <Button type="button" variant="outline" size="sm" onClick={handleAddSkill}>Add</Button>
              </div>
              {newProject.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {newProject.skills.map(s => (
                    <Badge key={s} variant="secondary" className="gap-1">
                      {s}
                      <button onClick={() => handleRemoveSkill(s)} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>Description <span className="text-destructive">*</span></Label>
              <Textarea placeholder="Describe your project in detail..." value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} rows={5} className="mt-1" />
            </div>
            <div>
              <Label>Visibility</Label>
              <Select value={newProject.visibility} onValueChange={v => setNewProject({ ...newProject, visibility: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Private">Private (Invite Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Attachments (Optional)</Label>
              <Button variant="outline" className="w-full mt-1 gap-2" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="w-4 h-4" />Attach Files
              </Button>
              <input ref={fileInputRef} type="file" multiple className="hidden" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => handlePublishProject(true)}>Save as Draft</Button>
              <Button className="flex-1" onClick={() => handlePublishProject(false)}>Publish Project</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Proposal Modal */}
      <Dialog open={showProposalModal} onOpenChange={setShowProposalModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Submit Proposal</DialogTitle></DialogHeader>
          {selectedProject && (
            <div className="bg-muted/50 rounded-lg p-3 mt-1">
              <p className="font-semibold text-sm">{selectedProject.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedProject.budget} · {selectedProject.duration}</p>
            </div>
          )}
          <div className="space-y-4 mt-2">
            <div>
              <Label>Proposal Message <span className="text-destructive">*</span></Label>
              <Textarea placeholder="Describe why you're the best fit for this project..." value={proposalForm.message} onChange={e => setProposalForm({ ...proposalForm, message: e.target.value })} rows={5} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Bid Amount ($) <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g., 3000" value={proposalForm.bidAmount} onChange={e => setProposalForm({ ...proposalForm, bidAmount: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Delivery Time <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g., 14 days" value={proposalForm.deliveryTime} onChange={e => setProposalForm({ ...proposalForm, deliveryTime: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Attach Portfolio/Files</Label>
              <Button variant="outline" className="w-full mt-1 gap-2" onClick={() => proposalFileRef.current?.click()}>
                <Paperclip className="w-4 h-4" />
                {proposalForm.attachmentName || "Attach Files"}
              </Button>
              <input ref={proposalFileRef} type="file" multiple className="hidden" onChange={e => {
                if (e.target.files?.[0]) setProposalForm({ ...proposalForm, attachmentName: e.target.files[0].name });
              }} />
            </div>
            <Button className="w-full" onClick={handleSubmitProposal}>
              <Send className="w-4 h-4 mr-2" />Submit Proposal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

