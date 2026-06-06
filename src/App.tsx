import { useEffect, useMemo, useState } from "react";
import Login from "./components/Login";
import Sidebar, { type NavKey } from "./components/Sidebar";
import StudentCard from "./components/StudentCard";
import StudentModal from "./components/StudentModal";
import AttendanceRing from "./components/AttendanceRing";
import { SEED_STUDENTS, type Student, COURSES, gradientFor, initials } from "./data";
import {
  AlertIcon,
  AnalyticsIcon,
  CheckCircleIcon,
  FilterIcon,
  KeyIcon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
  SettingsIcon,
  StudentsIcon,
  TrendUpIcon,
  TrophyIcon,
  UserIcon,
  WalletIcon,
} from "./icons";

/* ----------------- persistence keys ----------------- */
const AUTH_KEY = "edupulse.auth";
const STUDENTS_KEY = "edupulse.students";
const CREDS_KEY = "edupulse.creds";

type Creds = { username: string; password: string };
const DEFAULT_CREDS: Creds = { username: "admin", password: "admin123" };

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  /* ----------------- state ----------------- */
  const [creds, setCreds] = useState<Creds>(() => loadJSON(CREDS_KEY, DEFAULT_CREDS));
  const [authUser, setAuthUser] = useState<string | null>(() => loadJSON(AUTH_KEY, null));
  const [students, setStudents] = useState<Student[]>(() =>
    loadJSON(STUDENTS_KEY, SEED_STUDENTS)
  );
  const [nav, setNav] = useState<NavKey>("dashboard");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Student | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  /* ----------------- persistence effects ----------------- */
  useEffect(() => {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  }, [students]);
  useEffect(() => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
  }, [authUser]);
  useEffect(() => {
    localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
  }, [creds]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  /* ----------------- auth ----------------- */
  const handleLogin = (u: string, p: string) => {
    if (u === creds.username && p === creds.password) {
      setAuthUser(u);
      showToast(`Welcome back, ${u}!`);
      return true;
    }
    return false;
  };
  const handleLogout = () => {
    setAuthUser(null);
    setNav("dashboard");
  };

  /* ----------------- CRUD ----------------- */
  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (s: Student) => {
    setEditing(s);
    setModalOpen(true);
  };
  const saveStudent = (s: Student) => {
    setStudents((prev) => {
      const exists = prev.some((x) => x.id === s.id);
      return exists ? prev.map((x) => (x.id === s.id ? s : x)) : [s, ...prev];
    });
    setModalOpen(false);
    showToast(editing ? "Student record updated." : "New student enrolled.");
  };
  const doDelete = (s: Student) => {
    setStudents((prev) => prev.filter((x) => x.id !== s.id));
    setConfirmDelete(null);
    showToast("Student record removed.");
  };

  /* ----------------- derived ----------------- */
  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchesCourse = courseFilter === "All" || s.course === courseFilter;
      return matchesSearch && matchesCourse;
    });
  }, [students, search, courseFilter]);

  const stats = useMemo(() => {
    const total = students.length;
    const avgAttendance = total
      ? Math.round(students.reduce((a, s) => a + s.attendance, 0) / total)
      : 0;
    const totalFines = students.reduce((a, s) => a + s.fine, 0);
    const finedCount = students.filter((s) => s.fine > 0).length;
    const topScore = students.reduce((a, s) => Math.max(a, s.score), 0);
    const avgScore = total
      ? Math.round(students.reduce((a, s) => a + s.score, 0) / total)
      : 0;
    return { total, avgAttendance, totalFines, finedCount, topScore, avgScore };
  }, [students]);

  if (!authUser) {
    return <Login onLogin={handleLogin} />;
  }

  /* ----------------- header ----------------- */
  const titles: Record<NavKey, { t: string; s: string }> = {
    dashboard: { t: "Dashboard", s: "Real-time overview of your cohort" },
    students: { t: "Student Matrix", s: "Manage every learner profile" },
    analytics: { t: "Analytics", s: "Performance & attendance insights" },
    fines: { t: "Fines Center", s: "Outstanding dues & penalties" },
    settings: { t: "Settings", s: "Security & account preferences" },
  };

  return (
    <div className="app-bg flex min-h-screen">
      <Sidebar active={nav} onNavigate={setNav} onLogout={handleLogout} username={authUser} />

      <main className="relative flex-1 overflow-x-hidden">
        {/* top bar */}
        <header className="glass-soft sticky top-0 z-30 flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">{titles[nav].t}</h2>
            <p className="text-xs text-white/45 sm:text-sm">{titles[nav].s}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <SearchIcon
                width={17}
                height={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students…"
                className="w-44 rounded-xl bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/35 ring-1 ring-white/10 outline-none transition focus:w-60 focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/60"
              />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/40 transition hover:-translate-y-0.5 hover:shadow-indigo-500/60"
            >
              <PlusIcon width={17} height={17} />
              <span className="hidden sm:inline">Add Student</span>
            </button>
          </div>
        </header>

        <div className="p-5 sm:p-8">
          {(nav === "dashboard" || nav === "analytics") && (
            <StatGrid stats={stats} />
          )}

          {nav === "dashboard" && (
            <>
              <SectionHeader
                title="Recent Profiles"
                count={filtered.length}
                courseFilter={courseFilter}
                setCourseFilter={setCourseFilter}
              />
              <StudentGrid
                students={filtered.slice(0, 6)}
                onEdit={openEdit}
                onDelete={setConfirmDelete}
                onAdd={openAdd}
              />
            </>
          )}

          {nav === "students" && (
            <>
              <SectionHeader
                title="All Students"
                count={filtered.length}
                courseFilter={courseFilter}
                setCourseFilter={setCourseFilter}
              />
              <StudentGrid
                students={filtered}
                onEdit={openEdit}
                onDelete={setConfirmDelete}
                onAdd={openAdd}
              />
            </>
          )}

          {nav === "analytics" && <AnalyticsView students={students} />}

          {nav === "fines" && (
            <FinesView students={students} onEdit={openEdit} onDelete={setConfirmDelete} />
          )}

          {nav === "settings" && (
            <SettingsView
              creds={creds}
              onUpdate={(c) => {
                setCreds(c);
                showToast("Credentials updated successfully.");
              }}
            />
          )}
        </div>
      </main>

      {/* modal */}
      <StudentModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={saveStudent}
      />

      {/* delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="modal-pop glass relative w-full max-w-sm rounded-3xl p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-red-500 text-white shadow-lg shadow-rose-600/40">
              <AlertIcon width={28} height={28} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">Delete Student?</h3>
            <p className="mt-1 text-sm text-white/55">
              Remove <span className="font-semibold text-white">{confirmDelete.name}</span> from
              the matrix? This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-semibold text-white/70 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => doDelete(confirmDelete)}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/40 transition hover:-translate-y-0.5"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="modal-pop fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-emerald-600/40">
          <CheckCircleIcon width={18} height={18} />
          {toast}
        </div>
      )}
    </div>
  );
}

/* ===================== sub components ===================== */

type Stats = {
  total: number;
  avgAttendance: number;
  totalFines: number;
  finedCount: number;
  topScore: number;
  avgScore: number;
};

function StatGrid({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: "Total Students",
      value: stats.total,
      icon: StudentsIcon,
      grad: "from-indigo-500 to-violet-600",
      sub: "Enrolled learners",
    },
    {
      label: "Avg Attendance",
      value: `${stats.avgAttendance}%`,
      icon: TrendUpIcon,
      grad: "from-emerald-500 to-teal-600",
      sub: "Across cohort",
    },
    {
      label: "Outstanding Fines",
      value: `$${stats.totalFines}`,
      icon: WalletIcon,
      grad: "from-rose-500 to-red-600",
      sub: `${stats.finedCount} students flagged`,
    },
    {
      label: "Top Score",
      value: stats.topScore,
      icon: TrophyIcon,
      grad: "from-amber-400 to-orange-500",
      sub: `Avg ${stats.avgScore} pts`,
    },
  ];
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c, i) => (
        <div
          key={c.label}
          className="glass card-hover float-in relative overflow-hidden rounded-3xl p-5"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <div
            className={`pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${c.grad} opacity-30 blur-2xl`}
          />
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${c.grad} text-white shadow-lg`}
          >
            <c.icon width={22} height={22} />
          </div>
          <p className="mt-4 text-3xl font-bold text-white">{c.value}</p>
          <p className="mt-1 text-sm font-medium text-white/70">{c.label}</p>
          <p className="text-xs text-white/40">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({
  title,
  count,
  courseFilter,
  setCourseFilter,
}: {
  title: string;
  count: number;
  courseFilter: string;
  setCourseFilter: (s: string) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-400/30">
          {count}
        </span>
      </div>
      <div className="relative flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
        <FilterIcon width={15} height={15} className="text-white/40" />
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="bg-transparent text-sm text-white/80 outline-none"
        >
          <option value="All" className="bg-slate-900">
            All Courses
          </option>
          {COURSES.map((c) => (
            <option key={c} value={c} className="bg-slate-900">
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function StudentGrid({
  students,
  onEdit,
  onDelete,
  onAdd,
}: {
  students: Student[];
  onEdit: (s: Student) => void;
  onDelete: (s: Student) => void;
  onAdd: () => void;
}) {
  if (students.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center rounded-3xl py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-white/40 ring-1 ring-white/10">
          <StudentsIcon width={30} height={30} />
        </div>
        <p className="mt-4 text-base font-semibold text-white">No students found</p>
        <p className="mt-1 text-sm text-white/45">Try adjusting your filters or add a new one.</p>
        <button
          onClick={onAdd}
          className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/40 transition hover:-translate-y-0.5"
        >
          <PlusIcon width={16} height={16} />
          Enroll Student
        </button>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {students.map((s, i) => (
        <StudentCard key={s.id} student={s} index={i} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

function AnalyticsView({ students }: { students: Student[] }) {
  const ranked = [...students].sort((a, b) => b.score - a.score).slice(0, 6);
  const bands = [
    { label: "Excellent (85%+)", color: "from-emerald-500 to-teal-500", count: students.filter((s) => s.attendance >= 85).length },
    { label: "Good (70-84%)", color: "from-amber-400 to-yellow-500", count: students.filter((s) => s.attendance >= 70 && s.attendance < 85).length },
    { label: "At Risk (<70%)", color: "from-rose-500 to-red-600", count: students.filter((s) => s.attendance < 70).length },
  ];
  const max = Math.max(1, ...bands.map((b) => b.count));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="glass float-in rounded-3xl p-6">
        <div className="mb-5 flex items-center gap-2">
          <AnalyticsIcon width={18} height={18} className="text-indigo-300" />
          <h3 className="text-base font-bold text-white">Attendance Distribution</h3>
        </div>
        <div className="space-y-5">
          {bands.map((b) => (
            <div key={b.label}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-white/70">{b.label}</span>
                <span className="font-semibold text-white">{b.count}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${b.color} transition-all duration-1000`}
                  style={{ width: `${(b.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass float-in rounded-3xl p-6" style={{ animationDelay: "100ms" }}>
        <div className="mb-5 flex items-center gap-2">
          <TrophyIcon width={18} height={18} className="text-amber-300" />
          <h3 className="text-base font-bold text-white">Top Performers</h3>
        </div>
        <div className="space-y-3">
          {ranked.map((s, i) => (
            <div
              key={s.id}
              className="glass-soft flex items-center gap-3 rounded-2xl p-3"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold ${
                  i === 0
                    ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950"
                    : "bg-white/10 text-white/70"
                }`}
              >
                {i + 1}
              </span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradientFor(
                  s.id
                )} text-xs font-bold text-white`}
              >
                {initials(s.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{s.name}</p>
                <p className="text-xs text-white/40">{s.course}</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/30">
                <TrophyIcon width={12} height={12} />
                {s.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass float-in rounded-3xl p-6 lg:col-span-2" style={{ animationDelay: "200ms" }}>
        <h3 className="mb-5 text-base font-bold text-white">Attendance Rings Overview</h3>
        <div className="flex flex-wrap gap-6">
          {students.slice(0, 8).map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <AttendanceRing value={s.attendance} size={68} stroke={7} />
              <span className="max-w-[68px] truncate text-xs text-white/50">{s.name.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinesView({
  students,
  onEdit,
  onDelete,
}: {
  students: Student[];
  onEdit: (s: Student) => void;
  onDelete: (s: Student) => void;
}) {
  const fined = students.filter((s) => s.fine > 0).sort((a, b) => b.fine - a.fine);
  const total = fined.reduce((a, s) => a + s.fine, 0);

  return (
    <div>
      <div className="glass mb-6 flex items-center gap-4 rounded-3xl p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-600 to-red-500 text-white shadow-lg shadow-rose-600/40">
          <WalletIcon width={26} height={26} />
        </div>
        <div>
          <p className="text-sm text-white/55">Total Outstanding Dues</p>
          <p className="text-3xl font-bold text-white">${total}</p>
        </div>
        <div className="ml-auto rounded-full bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-300 ring-1 ring-rose-400/30">
          {fined.length} flagged
        </div>
      </div>

      {fined.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-3xl py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
            <CheckCircleIcon width={30} height={30} />
          </div>
          <p className="mt-4 text-base font-semibold text-white">All clear!</p>
          <p className="mt-1 text-sm text-white/45">No outstanding fines across your cohort.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {fined.map((s, i) => (
            <StudentCard key={s.id} student={s} index={i} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsView({
  creds,
  onUpdate,
}: {
  creds: Creds;
  onUpdate: (c: Creds) => void;
}) {
  const [username, setUsername] = useState(creds.username);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const field =
    "w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 ring-1 ring-white/10 outline-none transition focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/60";
  const label = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/45";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (current !== creds.password) {
      setMsg({ ok: false, text: "Current password is incorrect." });
      return;
    }
    if (next && next !== confirm) {
      setMsg({ ok: false, text: "New passwords do not match." });
      return;
    }
    onUpdate({ username: username.trim() || creds.username, password: next || creds.password });
    setMsg({ ok: true, text: "Settings saved." });
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="glass float-in rounded-3xl p-6 lg:col-span-2">
        <div className="mb-5 flex items-center gap-2">
          <KeyIcon width={18} height={18} className="text-indigo-300" />
          <h3 className="text-base font-bold text-white">Security & Credentials</h3>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={label}>
              <span className="inline-flex items-center gap-1.5">
                <UserIcon width={13} height={13} /> Username
              </span>
            </label>
            <input className={field} value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className={label}>Current Password</label>
            <input
              type="password"
              className={field}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>New Password</label>
              <input
                type="password"
                className={field}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="Leave blank to keep"
              />
            </div>
            <div>
              <label className={label}>Confirm New</label>
              <input
                type="password"
                className={field}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
              />
            </div>
          </div>

          {msg && (
            <p
              className={`rounded-lg px-3 py-2 text-xs font-medium ring-1 ${
                msg.ok
                  ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                  : "bg-rose-500/15 text-rose-300 ring-rose-400/30"
              }`}
            >
              {msg.text}
            </p>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/40 transition hover:-translate-y-0.5"
          >
            <SaveIcon width={16} height={16} />
            Save Changes
          </button>
        </form>
      </div>

      <div className="glass float-in rounded-3xl p-6" style={{ animationDelay: "100ms" }}>
        <div className="mb-5 flex items-center gap-2">
          <SettingsIcon width={18} height={18} className="text-indigo-300" />
          <h3 className="text-base font-bold text-white">About</h3>
        </div>
        <div className="space-y-3 text-sm text-white/60">
          <div className="glass-soft flex items-center justify-between rounded-xl px-4 py-3">
            <span>Version</span>
            <span className="font-mono text-white">2.4.0</span>
          </div>
          <div className="glass-soft flex items-center justify-between rounded-xl px-4 py-3">
            <span>Data Storage</span>
            <span className="font-semibold text-emerald-300">localStorage</span>
          </div>
          <div className="glass-soft flex items-center justify-between rounded-xl px-4 py-3">
            <span>Encryption</span>
            <span className="font-semibold text-indigo-300">Client-side</span>
          </div>
          <p className="pt-2 text-xs leading-relaxed text-white/40">
            EduPulse stores all records securely in your browser. Your data never leaves this
            device.
          </p>
        </div>
      </div>
    </div>
  );
}
