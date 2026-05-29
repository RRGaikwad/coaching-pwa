import { Page } from "./Sidebar";

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Dashboard",
  attendance: "Attendance",
  fees: "Fee Management",
  performance: "Performance Reports",
  students: "Student Management",
  teachers: "Teacher Management",
  announcements: "Announcements",
  profile: "My Profile",
};

interface Props {
  page: Page;
  onMenuClick: () => void;
}

export default function TopBar({ page, onMenuClick }: Props) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-800 leading-tight">{PAGE_TITLES[page]}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full border border-green-100">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Online
        </div>
      </div>
    </header>
  );
}
