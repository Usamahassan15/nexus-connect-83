import { LayoutDashboard, Package, ShoppingCart, DollarSign, BarChart3, Rocket, FileText, UserCircle, FolderKanban, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type DashboardSection =
  | "overview" | "gigs" | "orders" | "earnings" | "analytics" | "growth" | "custom-orders" | "profile"
  | "projects" | "buyer-orders" | "buyer-custom-orders";

interface DashboardSidebarProps {
  role: "seller" | "buyer";
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  onRoleSwitch: () => void;
}

const sellerMenu: { label: string; icon: React.ElementType; section: DashboardSection; badge?: string }[] = [
  { label: "Overview", icon: LayoutDashboard, section: "overview" },
  { label: "My Gigs", icon: Package, section: "gigs", badge: "4" },
  { label: "Orders", icon: ShoppingCart, section: "orders", badge: "3" },
  { label: "Earnings", icon: DollarSign, section: "earnings" },
  { label: "Analytics", icon: BarChart3, section: "analytics" },
  { label: "Growth & Marketing", icon: Rocket, section: "growth" },
  { label: "Custom Orders", icon: FileText, section: "custom-orders", badge: "2" },
  { label: "Profile Settings", icon: UserCircle, section: "profile" },
];

const buyerMenu: { label: string; icon: React.ElementType; section: DashboardSection; badge?: string }[] = [
  { label: "Overview", icon: LayoutDashboard, section: "overview" },
  { label: "My Projects", icon: FolderKanban, section: "projects", badge: "5" },
  { label: "Orders", icon: ShoppingCart, section: "buyer-orders", badge: "2" },
  { label: "Custom Orders", icon: FileText, section: "buyer-custom-orders", badge: "1" },
  { label: "Profile Settings", icon: UserCircle, section: "profile" },
];

export default function DashboardSidebar({ role, activeSection, onSectionChange, onRoleSwitch }: DashboardSidebarProps) {
  const menu = role === "seller" ? sellerMenu : buyerMenu;

  return (
    <aside className="w-full md:w-60 lg:w-64 bg-card border-r border-border/50 flex flex-col h-full">
      {/* Role Toggle */}
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <div className={cn(
            "flex-1 text-center py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all",
            role === "seller" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
          )} onClick={() => role !== "seller" && onRoleSwitch()}>
            Seller
          </div>
          <div className={cn(
            "flex-1 text-center py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all",
            role === "buyer" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
          )} onClick={() => role !== "buyer" && onRoleSwitch()}>
            Buyer
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full text-xs gap-1.5 text-muted-foreground" onClick={onRoleSwitch}>
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Switch to {role === "seller" ? "Buyer" : "Seller"} Mode
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {menu.map((item) => (
          <button
            key={item.section}
            onClick={() => onSectionChange(item.section)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeSection === item.section
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge variant={activeSection === item.section ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-5">
                {item.badge}
              </Badge>
            )}
          </button>
        ))}
      </nav>

    </aside>
  );
}
