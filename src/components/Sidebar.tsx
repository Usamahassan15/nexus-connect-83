import { Home, Compass, MessageCircle, User, Handshake, Settings, FolderKanban, Car, Wallet } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Sidebar = () => {
  const location = useLocation();
  const isProjectsActive = location.pathname === "/services" && location.search.includes("openProjects=1");
  const isServicesActive = location.pathname === "/services" && !location.search.includes("openProjects=1");

  const navItems = [
    { icon: Home, label: "Home", path: "/", end: true },
    { icon: Compass, label: "Explore", path: "/explore" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: FolderKanban, label: "Projects & Bidding", path: "/services?openProjects=1", forcedActive: isProjectsActive, forcedInactive: !isProjectsActive },
    { icon: Handshake, label: "Services", path: "/services", forcedActive: isServicesActive, forcedInactive: !isServicesActive },
    { icon: Car, label: "Rides", path: "/transport" },
    { icon: Wallet, label: "Wallet", path: "/wallet" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold gradient-text">SocialHub</h1>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.label} to={item.path} end={item.end}>
            {({ isActive }) => {
              const active = item.forcedInactive ? false : (item.forcedActive ?? isActive);
              return (
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              );
            }}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
