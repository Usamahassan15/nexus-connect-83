import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import DashboardSidebar, { type DashboardSection } from "@/components/services-dashboard/DashboardSidebar";
import SellerOverview from "@/components/services-dashboard/SellerOverview";
import SellerGigs from "@/components/services-dashboard/SellerGigs";
import SellerOrders from "@/components/services-dashboard/SellerOrders";
import SellerEarnings from "@/components/services-dashboard/SellerEarnings";
import SellerAnalytics from "@/components/services-dashboard/SellerAnalytics";
import SellerGrowth from "@/components/services-dashboard/SellerGrowth";
import SellerCustomOrders from "@/components/services-dashboard/SellerCustomOrders";
import SellerProfileSettings from "@/components/services-dashboard/SellerProfileSettings";
import BuyerOverview from "@/components/services-dashboard/BuyerOverview";
import BuyerProjects from "@/components/services-dashboard/BuyerProjects";
import BuyerOrders from "@/components/services-dashboard/BuyerOrders";
import BuyerCustomOrders from "@/components/services-dashboard/BuyerCustomOrders";

export default function ServicesDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "buyer" ? "buyer" : "seller";
  const [role, setRole] = useState<"seller" | "buyer">(initialRole);
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "buyer" || r === "seller") {
      setRole(r);
      setActiveSection("overview");
    }
  }, [searchParams]);

  const handleRoleSwitch = () => {
    setRole(prev => prev === "seller" ? "buyer" : "seller");
    setActiveSection("overview");
  };

  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    if (role === "seller") {
      switch (activeSection) {
        case "overview": return <SellerOverview />;
        case "gigs": return <SellerGigs />;
        case "orders": return <SellerOrders />;
        case "earnings": return <SellerEarnings />;
        case "analytics": return <SellerAnalytics />;
        case "growth": return <SellerGrowth />;
        case "custom-orders": return <SellerCustomOrders />;
        case "profile": return <SellerProfileSettings />;
        default: return <SellerOverview />;
      }
    } else {
      switch (activeSection) {
        case "overview": return <BuyerOverview />;
        case "projects": return <BuyerProjects />;
        case "buyer-orders": return <BuyerOrders />;
        case "buyer-custom-orders": return <BuyerCustomOrders />;
        case "profile": return <SellerProfileSettings />;
        default: return <BuyerOverview />;
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0">
        <DashboardSidebar
          role={role}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onRoleSwitch={handleRoleSwitch}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3 flex items-center gap-3">
          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <DashboardSidebar
                role={role}
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                onRoleSwitch={handleRoleSwitch}
              />
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground capitalize">
              {role === "seller" ? "Seller" : "Buyer"} Dashboard
            </h1>
          </div>

          <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Close dashboard" onClick={() => navigate("/services")}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 max-w-5xl">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
