import { User, Role } from "../../data/store";

export type Page =
  | "dashboard"
  | "attendance"
  | "fees"
  | "performance"
  | "students"
  | "teachers"
  | "announcements"
  | "profile";

interface NavItem {
  id: Page;
  label: string;
  icon: string;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",     label: "Dashboard",      icon: "🏠", roles: ["admin", "student", "parent", "teacher"] },
  { id: "attendance",    label: "Attendance",     icon: "📋", roles: ["admin", "student", "parent", "teacher"] },
  { id: "fees",          label: "Fees",           icon: "💳", roles: ["admin", "student", "parent"] },
  { id: "performance",   label: "Performance",    icon: "📊", roles: ["admin", "student", "parent"] },
  { id: "students",      label: "Students",       icon: "👥", roles: ["admin"] },
  { id: "teachers",      label: "Teachers",       icon: "👨‍🏫", roles: ["admin"] },
  { id: "announcements", label: "Announcements",  icon: "📢", roles: ["admin", "student", "parent", "teacher"] },
];

interface Props {
  user: User;
  activePage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ user, activePage, onNavigate, onLogout, mobileOpen, onMobileClose }: Props) {
  const visible = NAV_ITEMS.filter((n) => n.roles.includes(user.role));

  const roleColors: Record<Role, string> = {
    admin: "bg-indigo-600",
    student: "bg-emerald-600",
    parent: "bg-amber-600",
    teacher: "bg-blue-600",
  };

  const roleLabels: Record<Role, string> = {
    admin: "Administrator",
    student: "Student",
    parent: "Parent",
    teacher: "Teacher",
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-lg">📚</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">EduCoach</p>
            <p className="text-xs text-gray-400">Management System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${roleColors[user.role]} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full text-white ${roleColors[user.role]}`}>
              {roleLabels[user.role]}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visible.map((item) => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); onMobileClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <span className="text-base">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200 h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} />
          <aside className="relative w-64 bg-white h-full shadow-2xl flex flex-col z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
