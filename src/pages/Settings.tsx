import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  LogOut, 
  Trash2, 
  Camera,
  Lock,
  Heart,
  UserPlus,
  Bookmark,
  HeadphonesIcon,
  Ban,
  ChevronRight,
  Share2,
  Volume2,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
  Activity,
  Globe,
  FileText,
  Info,
  MessageCircle,
  Users2,
  Eye
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import InviteFriendsDialog from "@/components/InviteFriendsDialog";
import SavedPostsDialog from "@/components/SavedPostsDialog";
import BlockedPeopleDialog from "@/components/BlockedPeopleDialog";
import ShareProfileModal from "@/components/ShareProfileModal";
import SupportDialog from "@/components/SupportDialog";
import InterestsDialog from "@/components/InterestsDialog";

export default function Settings() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem("sound-effects-enabled") !== "false"; } catch { return true; }
  });
  const [deleteReason, setDeleteReason] = useState("");
  const [showInviteFriends, setShowInviteFriends] = useState(false);
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [showInterests, setShowInterests] = useState(false);
  const [showBlockedPeople, setShowBlockedPeople] = useState(false);
  const [showShareProfile, setShowShareProfile] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    allowMessages: true,
    privateAccount: false,
  });
  const [messagePermission, setMessagePermission] = useState("everyone");
  const [followPermission, setFollowPermission] = useState("everyone");
  const [postsVisibility, setPostsVisibility] = useState("everyone");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [emailValue, setEmailValue] = useState("alex.johnson@email.com");
  const [phoneValue, setPhoneValue] = useState("");
  const [showLoginDevices, setShowLoginDevices] = useState(false);
  const [showSecurityActivity, setShowSecurityActivity] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [notifExtra, setNotifExtra] = useState({
    services: true,
    transport: true,
  });
  const [appearanceMode, setAppearanceMode] = useState<"light" | "dark" | "system">("light");
  const [language, setLanguage] = useState("en");
  const [devices, setDevices] = useState([
    { id: 1, name: "iPhone 14 Pro", location: "San Francisco, CA", current: true },
    { id: 2, name: "Chrome on Windows", location: "New York, NY", current: false },
    { id: 3, name: "iPad Air", location: "Los Angeles, CA", current: false },
  ]);
  const securityActivity = [
    { id: 1, action: "Signed in from new device", time: "2 hours ago" },
    { id: 2, action: "Password changed", time: "3 days ago" },
    { id: 3, action: "Signed in from Chrome on Windows", time: "1 week ago" },
  ];

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
  };

  const handleAppearanceModeChange = (mode: "light" | "dark" | "system") => {
    setAppearanceMode(mode);
    if (mode === "light") {
      handleDarkModeToggle(false);
    } else if (mode === "dark") {
      handleDarkModeToggle(true);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      handleDarkModeToggle(prefersDark);
    }
  };

  const handleRemoveDevice = (id: number) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    toast({ title: "Logged out from device" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/welcome", { replace: true });
  };

  const handleDeleteAccount = () => {
    if (!deleteReason.trim()) {
      alert("Please provide a reason for deleting your account");
      return;
    }
    console.log("Deleting account with reason:", deleteReason);
    navigate("/auth");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      
      <main className="flex-1 md:ml-64 pb-20 sm:pb-24 md:pb-8 pt-14 md:pt-14">
        <div className="max-w-2xl lg:max-w-3xl mx-auto lg:-translate-x-32 px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-5 md:pt-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-7 md:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-1 sm:mb-2">
              Settings
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your account preferences</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 sm:space-y-5 md:space-y-6"
          >
            {/* Quick Actions - Desktop Only */}
            <Card className="hidden md:block">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Frequently used settings</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 justify-start gap-3"
                  onClick={() => setShowInterests(true)}
                >
                  <Heart className="w-5 h-5 text-primary" />
                  My Interests
                </Button>
                <Button
                  variant="outline"
                  className="h-12 justify-start gap-3"
                  onClick={() => setShowInviteFriends(true)}
                >
                  <UserPlus className="w-5 h-5 text-primary" />
                  Invite Friends
                </Button>
                <Button
                  variant="outline"
                  className="h-12 justify-start gap-3"
                  onClick={() => setShowSavedPosts(true)}
                >
                  <Bookmark className="w-5 h-5 text-primary" />
                  Saved Lists
                </Button>
                <Button
                  variant="outline"
                  className="h-12 justify-start gap-3"
                  onClick={() => setShowSupport(true)}
                >
                  <HeadphonesIcon className="w-5 h-5 text-primary" />
                  Support
                </Button>
                <Button
                  variant="outline"
                  className="h-12 justify-start gap-3"
                  onClick={() => setShowShareProfile(true)}
                >
                  <Share2 className="w-5 h-5 text-primary" />
                  Share Profile
                </Button>
                <Button
                  variant="outline"
                  className="h-12 justify-start gap-3"
                  onClick={() => setShowBlockedPeople(true)}
                >
                  <Ban className="w-5 h-5 text-primary" />
                  Blocked People
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>
            {/* Profile Settings */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <CardTitle className="text-base sm:text-lg">Profile Settings</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">Manage your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                      <AvatarFallback>AJ</AvatarFallback>
                    </Avatar>
                    <Button 
                      size="icon" 
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                    >
                      <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground">Alex Johnson</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">alex.johnson@email.com</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate("/profile")}>Edit Profile</Button>
                </div>
                <Separator />
                <button
                  className="w-full flex items-center justify-between py-2 text-left"
                  onClick={() => setShowEmailDialog(true)}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm sm:text-base text-foreground">Email</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{emailValue}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <Separator />
                <button
                  className="w-full flex items-center justify-between py-2 text-left"
                  onClick={() => setShowPhoneDialog(true)}
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm sm:text-base text-foreground">Phone</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{phoneValue || "Not added"}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <CardTitle className="text-base sm:text-lg">Appearance</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">Customize how the app looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-sm sm:text-base">Dark Mode</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Enable dark theme</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={handleDarkModeToggle}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Theme</Label>
                  <RadioGroup
                    value={appearanceMode}
                    onValueChange={(v) => handleAppearanceModeChange(v as "light" | "dark" | "system")}
                    className="flex flex-col sm:flex-row gap-3 pt-1"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="light" id="theme-light" />
                      <Label htmlFor="theme-light" className="text-sm font-normal cursor-pointer">Light</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="dark" id="theme-dark" />
                      <Label htmlFor="theme-dark" className="text-sm font-normal cursor-pointer">Dark</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="system" id="theme-system" />
                      <Label htmlFor="theme-system" className="text-sm font-normal cursor-pointer">System Default</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Language */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <CardTitle className="text-base sm:text-lg">Language</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">Choose your preferred language</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={language}
                  onValueChange={(v) => {
                    setLanguage(v);
                    toast({ title: "Language updated" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ur">اردو</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Sound Effects */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <CardTitle className="text-base sm:text-lg">Sound Effects</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">Control interaction sounds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound-effects" className="text-sm sm:text-base">Enable Sound Effects</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Play subtle sounds on like, share, save & more</p>
                  </div>
                  <Switch
                    id="sound-effects"
                    checked={soundEnabled}
                    onCheckedChange={(checked) => {
                      setSoundEnabled(checked);
                      localStorage.setItem("sound-effects-enabled", String(checked));
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <CardTitle className="text-base sm:text-lg">Notifications</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">Manage notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notif-push" className="text-sm sm:text-base font-semibold">Push Notifications</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Master switch for all notifications</p>
                  </div>
                  <Switch
                    id="notif-push"
                    checked={pushEnabled}
                    onCheckedChange={setPushEnabled}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-likes" className="text-sm sm:text-base">Likes</Label>
                  <Switch
                    id="notif-likes"
                    disabled={!pushEnabled}
                    checked={notifications.likes}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, likes: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-comments" className="text-sm sm:text-base">Comments</Label>
                  <Switch
                    id="notif-comments"
                    disabled={!pushEnabled}
                    checked={notifications.comments}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, comments: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-messages" className="text-sm sm:text-base">Messages</Label>
                  <Switch
                    id="notif-messages"
                    disabled={!pushEnabled}
                    checked={notifications.messages}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, messages: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-follows" className="text-sm sm:text-base">Followers</Label>
                  <Switch
                    id="notif-follows"
                    disabled={!pushEnabled}
                    checked={notifications.follows}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, follows: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-services" className="text-sm sm:text-base">Services</Label>
                  <Switch
                    id="notif-services"
                    disabled={!pushEnabled}
                    checked={notifExtra.services}
                    onCheckedChange={(checked) => 
                      setNotifExtra({ ...notifExtra, services: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-transport" className="text-sm sm:text-base">Rides</Label>
                  <Switch
                    id="notif-transport"
                    disabled={!pushEnabled}
                    checked={notifExtra.transport}
                    onCheckedChange={(checked) => 
                      setNotifExtra({ ...notifExtra, transport: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <CardTitle className="text-base sm:text-lg">Privacy & Security</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">Control your privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="profile-visible" className="text-sm sm:text-base">Profile Visibility</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Make profile visible to everyone</p>
                  </div>
                  <Switch
                    id="profile-visible"
                    checked={privacy.profileVisible}
                    onCheckedChange={(checked) => 
                      setPrivacy({ ...privacy, profileVisible: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="show-email" className="text-sm sm:text-base">Show Email</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Display email on profile</p>
                  </div>
                  <Switch
                    id="show-email"
                    checked={privacy.showEmail}
                    onCheckedChange={(checked) => 
                      setPrivacy({ ...privacy, showEmail: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="allow-messages" className="text-sm sm:text-base">Allow Messages</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Let others send you messages</p>
                  </div>
                  <Switch
                    id="allow-messages"
                    checked={privacy.allowMessages}
                    onCheckedChange={(checked) => 
                      setPrivacy({ ...privacy, allowMessages: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="private-account" className="text-sm sm:text-base font-semibold">Private Account</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Only approved followers can see your posts and profile content
                    </p>
                  </div>
                  <Switch
                    id="private-account"
                    checked={privacy.privateAccount}
                    onCheckedChange={(checked) => 
                      setPrivacy({ ...privacy, privateAccount: checked })
                    }
                  />
                </div>
                {privacy.privateAccount && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg bg-muted/50 p-3 space-y-1.5"
                  >
                    <p className="text-xs font-medium text-foreground">🔒 Private Mode Active</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                      <li>Only approved followers can see your posts</li>
                      <li>New followers must send a request</li>
                      <li>Your profile info is hidden from non-followers</li>
                    </ul>
                  </motion.div>
                )}
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Who can message me</Label>
                  <Select value={messagePermission} onValueChange={setMessagePermission}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="followers">Followers</SelectItem>
                      <SelectItem value="nobody">Nobody</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base flex items-center gap-2"><Users2 className="w-4 h-4" /> Who can follow me</Label>
                  <Select value={followPermission} onValueChange={setFollowPermission}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="followers">Followers</SelectItem>
                      <SelectItem value="nobody">Nobody</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base flex items-center gap-2"><Eye className="w-4 h-4" /> Who can see my posts</Label>
                  <Select value={postsVisibility} onValueChange={setPostsVisibility}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="followers">Followers</SelectItem>
                      <SelectItem value="nobody">Nobody</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <Button 
                  variant="outline" 
                  className="w-full gap-2 h-10 sm:h-11 text-sm sm:text-base"
                  onClick={() => setShowBlockedPeople(true)}
                >
                  <Ban className="w-4 h-4" />
                  Blocked Users
                </Button>
                <Separator />
                <Button 
                  variant="outline" 
                  className="w-full gap-2 h-10 sm:h-11 text-sm sm:text-base"
                  onClick={() => navigate("/change-password")}
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </Button>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <CardTitle className="text-base sm:text-lg">Security</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">Keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  className="w-full flex items-center justify-between py-2 text-left"
                  onClick={() => navigate("/two-factor")}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm sm:text-base text-foreground">Two-Factor Authentication</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <Separator />
                <button
                  className="w-full flex items-center justify-between py-2 text-left"
                  onClick={() => setShowLoginDevices(true)}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm sm:text-base text-foreground">Login Devices</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <Separator />
                <button
                  className="w-full flex items-center justify-between py-2 text-left"
                  onClick={() => setShowSecurityActivity(true)}
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm sm:text-base text-foreground">Security Activity</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            {/* Other */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <CardTitle className="text-base sm:text-lg">Other</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">More info & support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  className="w-full flex items-center justify-between py-2 text-left"
                  onClick={() => setShowSupport(true)}
                >
                  <div className="flex items-center gap-2">
                    <HeadphonesIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm sm:text-base text-foreground">Help Center</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <Separator />
                <button
                  className="w-full flex items-center justify-between py-2 text-left"
                  onClick={() => setShowTerms(true)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm sm:text-base text-foreground">Terms of Service</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <Separator />
                <button
                  className="w-full flex items-center justify-between py-2 text-left"
                  onClick={() => setShowPrivacyPolicy(true)}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm sm:text-base text-foreground">Privacy Policy</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <Separator />
                <button
                  className="w-full flex items-center justify-between py-2 text-left"
                  onClick={() => setShowAbout(true)}
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm sm:text-base text-foreground">About</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="border-destructive/50">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-destructive text-base sm:text-lg">Account Actions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full gap-2 h-10 sm:h-11 text-sm sm:text-base"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2 h-10 sm:h-11 text-sm sm:text-base">
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-md mx-3 sm:mx-auto">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-base sm:text-lg">Delete Account?</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs sm:text-sm">
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                      <Label htmlFor="delete-reason" className="text-sm">Please tell us why (required)</Label>
                      <Textarea
                        id="delete-reason"
                        placeholder="Your reason for deleting your account..."
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        rows={3}
                        className="text-sm"
                      />
                    </div>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto m-0">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                        onClick={handleDeleteAccount}
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <MobileNav />

      <InviteFriendsDialog isOpen={showInviteFriends} onClose={() => setShowInviteFriends(false)} />
      <SavedPostsDialog isOpen={showSavedPosts} onClose={() => setShowSavedPosts(false)} />
      <InterestsDialog isOpen={showInterests} onClose={() => setShowInterests(false)} />
      <BlockedPeopleDialog isOpen={showBlockedPeople} onClose={() => setShowBlockedPeople(false)} />
      <ShareProfileModal isOpen={showShareProfile} onClose={() => setShowShareProfile(false)} />
      <SupportDialog isOpen={showSupport} onClose={() => setShowSupport(false)} />

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Email</DialogTitle>
            <DialogDescription>Update the email address associated with your account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="email-input">Email Address</Label>
              <input
                id="email-input"
                type="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setShowEmailDialog(false);
                toast({ title: "Email updated successfully" });
              }}
            >
              Save Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phone Dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Phone Number</DialogTitle>
            <DialogDescription>Update the phone number associated with your account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="phone-input">Phone Number</Label>
              <input
                id="phone-input"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneValue}
                onChange={(e) => setPhoneValue(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setShowPhoneDialog(false);
                toast({ title: "Phone number updated successfully" });
              }}
            >
              Save Phone
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Devices Dialog */}
      <Dialog open={showLoginDevices} onOpenChange={setShowLoginDevices}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Login Devices</DialogTitle>
            <DialogDescription>Devices currently signed in to your account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {devices.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No other devices logged in.</p>
            )}
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{device.name} {device.current && <span className="text-xs text-primary">(This device)</span>}</p>
                    <p className="text-xs text-muted-foreground">{device.location}</p>
                  </div>
                </div>
                {!device.current && (
                  <Button variant="outline" size="sm" onClick={() => handleRemoveDevice(device.id)}>
                    Log out
                  </Button>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Activity Dialog */}
      <Dialog open={showSecurityActivity} onOpenChange={setShowSecurityActivity}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Security Activity</DialogTitle>
            <DialogDescription>Recent activity on your account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {securityActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <Activity className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Center Dialog */}
      <Dialog open={showHelpCenter} onOpenChange={setShowHelpCenter}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Help Center</DialogTitle>
            <DialogDescription>Frequently asked questions</DialogDescription>
          </DialogHeader>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm">How do I reset my password?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Go to Settings &gt; Account &gt; Change Password and follow the instructions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm">How do I delete my account?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Go to Settings &gt; Account Actions &gt; Delete Account and provide a reason.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-sm">How do I block someone?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Visit the user's profile and select Block User from the menu, or manage blocked users in Settings.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </DialogContent>
      </Dialog>

      {/* Terms Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>Last updated January 2024</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-2 max-h-80 overflow-y-auto">
            <p>By using this app, you agree to abide by our community guidelines and applicable laws.</p>
            <p>You are responsible for the content you post and must respect the rights of other users.</p>
            <p>We reserve the right to suspend accounts that violate these terms.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>Last updated January 2024</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-2 max-h-80 overflow-y-auto">
            <p>We collect minimal data required to provide our services and never sell your personal information.</p>
            <p>You can control what information is visible to others via Privacy settings.</p>
            <p>You may request deletion of your data at any time by deleting your account.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>About</DialogTitle>
            <DialogDescription>App information</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Version 1.0.0</p>
            <p>Made with care for connecting people around the world.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
