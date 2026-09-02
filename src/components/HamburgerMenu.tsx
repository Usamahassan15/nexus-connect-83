import { supabase } from "@/integrations/supabase/client";
import { Heart, UserPlus, Bookmark, HeadphonesIcon, Ban, LayoutDashboard, LogOut, Settings, Car, Wallet, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SavedPostsDialog from "./SavedPostsDialog";
import InviteFriendsDialog from "./InviteFriendsDialog";
import BlockedPeopleDialog from "./BlockedPeopleDialog";
import SupportDialog from "./SupportDialog";
import InterestsDialog from "./InterestsDialog";
import { toast } from "@/hooks/use-toast";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const HamburgerMenu = ({ isOpen, onClose }: HamburgerMenuProps) => {
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [showInviteFriends, setShowInviteFriends] = useState(false);
  const [showBlockedPeople, setShowBlockedPeople] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showInterests, setShowInterests] = useState(false);
  const [mode, setMode] = useState<"seller" | "buyer">("seller");
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: Car,
      label: "Rides",
      onClick: () => {
        navigate("/transport");
        onClose();
      },
    },
    {
      icon: UserPlus,
      label: "Invite Friends",
      onClick: () => {
        setShowInviteFriends(true);
      },
    },
    {
      icon: Bookmark,
      label: "Saved Lists",
      onClick: () => {
        setShowSavedPosts(true);
      },
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => {
        navigate("/settings");
        onClose();
      },
    },
    {
      icon: Wallet,
      label: "Wallet",
      onClick: () => {
        navigate("/wallet");
        onClose();
      },
    },
    {
      icon: Flag,
      label: "Report Center",
      onClick: () => {
        navigate("/report-center");
        onClose();
      },
    },
    {
      icon: Heart,
      label: "My Interests",
      onClick: () => {
        setShowInterests(true);
      },
    },

    {
      icon: HeadphonesIcon,
      label: "Support",
      onClick: () => {
        setShowSupport(true);
      },
    },
    {
      icon: Ban,
      label: "Blocked People",
      onClick: () => {
        setShowBlockedPeople(true);
      },
    },
  ];


  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/welcome", { replace: true });
    onClose();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-72 flex flex-col">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-2">
            <Button
              className="w-full justify-center h-11 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold"
              onClick={() => {
                const nextRole = mode === "seller" ? "buyer" : "seller";
                setMode(nextRole);
                navigate(`/services/dashboard?role=${nextRole}`);
                onClose();
              }}
            >
              {mode === "seller" ? "Switch to Buying" : "Switch to Selling"}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-11"
              onClick={() => {
                navigate("/services/dashboard");
                onClose();
              }}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </Button>
          </div>

          <Separator className="mt-4" />

          <div className="flex-1 mt-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start gap-3 h-12"
                onClick={item.onClick}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-base">{item.label}</span>
              </Button>
            ))}
          </div>

          <div className="mt-auto pb-4">
            <Separator className="mb-4" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-base">Logout</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <SavedPostsDialog 
        isOpen={showSavedPosts} 
        onClose={() => {
          setShowSavedPosts(false);
          onClose();
        }} 
      />
      
      <InviteFriendsDialog 
        isOpen={showInviteFriends} 
        onClose={() => {
          setShowInviteFriends(false);
          onClose();
        }} 
      />

      <BlockedPeopleDialog
        isOpen={showBlockedPeople}
        onClose={() => {
          setShowBlockedPeople(false);
          onClose();
        }}
      />

      <SupportDialog
        isOpen={showSupport}
        onClose={() => {
          setShowSupport(false);
          onClose();
        }}
      />

      <InterestsDialog
        isOpen={showInterests}
        onClose={() => {
          setShowInterests(false);
          onClose();
        }}
      />
    </>
  );
};

export default HamburgerMenu;