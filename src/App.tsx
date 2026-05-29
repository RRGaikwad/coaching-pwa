import { useState, useEffect } from "react";
import { Store, User } from "./data/store";
import LoginPage from "./components/LoginPage";
import Sidebar, { Page } from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import Dashboard from "./components/pages/Dashboard";
import Attendance from "./components/pages/Attendance";
import Fees from "./components/pages/Fees";
import Performance from "./components/pages/Performance";
import Students from "./components/pages/Students";
import Teachers from "./components/pages/Teachers";
import Announcements from "./components/pages/Announcements";

export default function App() {
  const [user, setUser] = useState<User | null>(Store.getSession());
  const [activePage, setActivePage] = useState<Page>(Store.getPage() as Page);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    Store.setPage(activePage);
  }, [activePage]);

  useEffect(() => {
    // Register a minimal SW for PWA support
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => {});
      });
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    Store.setSession(null);
    setUser(null);
    setActivePage("dashboard");
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":     return <Dashboard user={user} onNavigate={(p) => setActivePage(p as Page)} />;
      case "attendance":    return <Attendance user={user} />;
      case "fees":          return <Fees user={user} />;
      case "performance":   return <Performance user={user} />;
      case "students":      return <Students user={user} />;
      case "teachers":      return <Teachers user={user} />;
      case "announcements": return <Announcements user={user} />;
      default:              return <Dashboard user={user} onNavigate={(p) => setActivePage(p as Page)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        user={user}
        activePage={activePage}
        onNavigate={(page) => { setActivePage(page); setMobileMenuOpen(false); }}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          page={activePage}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {renderPage()}
          </div>
        </main>
        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden bg-white border-t border-gray-200 flex items-center justify-around py-2 sticky bottom-0 z-20 shadow-lg">
          {[
            { page: "dashboard", icon: "🏠", label: "Home", roles: ["admin", "student", "parent", "teacher"] },
            { page: "attendance", icon: "📋", label: "Attend", roles: ["admin", "student", "parent", "teacher"] },
            { page: "teachers", icon: "👨‍🏫", label: "Teachers", roles: ["admin"] },
            { page: "students", icon: "👥", label: "Students", roles: ["admin"] },
            { page: "fees", icon: "💳", label: "Fees", roles: ["student", "parent"] },
            { page: "announcements", icon: "📢", label: "News", roles: ["admin", "student", "parent", "teacher"] },
          ].filter(item => item.roles.includes(user.role)).slice(0, 5).map((item) => {
            const isActive = activePage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => setActivePage(item.page as Page)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${isActive ? "text-indigo-600" : "text-gray-400"}`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className={`text-[10px] font-medium ${isActive ? "text-indigo-600" : "text-gray-400"}`}>{item.label}</span>
                {isActive && <span className="w-1 h-1 bg-indigo-600 rounded-full" />}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
