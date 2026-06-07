import {
  AnalyticsIcon,
  BookIcon,
  DashboardIcon,
  LogoutIcon,
  SettingsIcon,
  ShieldIcon,
  StudentsIcon,
  WalletIcon,
} from "../icons";

export type NavKey = "dashboard" | "students" | "classes" | "analytics" | "fines" | "settings";

type Props = {
  active: NavKey;
  onNavigate: (k: NavKey) => void;
  onLogout: () => void;
  username: string;
};

const items: { key: NavKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: "dashboard", label: "Dashboard", icon: DashboardIcon },
  { key: "students", label: "Students", icon: StudentsIcon },
  { key: "classes", label: "Classes", icon: BookIcon },
  { key: "analytics", label: "Analytics", icon: AnalyticsIcon },
  { key: "fines", label: "Fines", icon: WalletIcon },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ active, onNavigate, onLogout, username }: Props) {
  return (
    <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col p-5 lg:flex">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/40">
          <ShieldIcon width={24} height={24} />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight text-white">EduPulse</h1>
          <p className="text-[10px] uppercase tracking-widest text-white/40">
            Management Suite
          </p>
        </div>
      </div>

      <nav className="mt-8 flex-1 space-y-1.5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Workspace
        </p>
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-indigo-500/30 to-violet-500/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-fuchsia-500" />
              )}
              <Icon
                width={19}
                height={19}
                className={isActive ? "text-indigo-300" : "transition group-hover:text-indigo-300"}
              />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="glass-soft flex items-center gap-3 rounded-2xl p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{username}</p>
            <p className="text-[11px] text-emerald-400">● Online</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-2.5 text-sm font-semibold text-rose-300 ring-1 ring-white/10 transition hover:bg-rose-500/20 hover:text-white hover:ring-rose-400/40"
        >
          <LogoutIcon width={17} height={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
