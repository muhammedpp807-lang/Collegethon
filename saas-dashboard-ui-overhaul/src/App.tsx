import { useEffect, useMemo, useState } from "react";
import Login from "./components/Login";
import Sidebar, { type NavKey } from "./components/Sidebar";
import StudentCard from "./components/StudentCard";
import StudentModal from "./components/StudentModal";
import AttendanceRing from "./components/AttendanceRing";
import {
  COURSES,
  SEED_CLASSES,
  SEED_STUDENTS,
  type Achievement,
  type ClassGroup,
  type Student,
  gradientFor,
  initials,
  normalizeStudent,
} from "./data";
import {
  AlertIcon,
  AnalyticsIcon,
  BookIcon,
  CheckCircleIcon,
  EditIcon,
  FilterIcon,
  KeyIcon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
  StudentsIcon,
  TrashIcon,
  TrendUpIcon,
  TrophyIcon,
  WalletIcon,
  XIcon,
} from "./icons";

const AUTH_KEY = "edupulse.auth";
const STUDENTS_KEY = "edupulse.students";
const CREDS_KEY = "edupulse.creds";
const CLASSES_KEY = "edupulse.classes";

type Creds = { username: string; password: string };
type Auth = { role: "admin" | "student"; username: string; studentId?: string } | null;
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
  const [creds, setCreds] = useState<Creds>(() => loadJSON(CREDS_KEY, DEFAULT_CREDS));
  const [auth, setAuth] = useState<Auth>(() => loadJSON(AUTH_KEY, null));
  const [students, setStudents] = useState<Student[]>(() =>
    loadJSON<Partial<Student>[]>(STUDENTS_KEY, SEED_STUDENTS).map(normalizeStudent)
  );
  const [classes, setClasses] = useState<ClassGroup[]>(() => loadJSON(CLASSES_KEY, SEED_CLASSES));
  const [nav, setNav] = useState<NavKey>("dashboard");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [profile, setProfile] = useState<Student | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Student | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => localStorage.setItem(STUDENTS_KEY, JSON.stringify(students)), [students]);
  useEffect(() => localStorage.setItem(CLASSES_KEY, JSON.stringify(classes)), [classes]);
  useEffect(() => localStorage.setItem(AUTH_KEY, JSON.stringify(auth)), [auth]);
  useEffect(() => localStorage.setItem(CREDS_KEY, JSON.stringify(creds)), [creds]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const className = (id?: string) => classes.find((c) => c.id === id)?.name || "No Class";

  const handleLogin = (username: string, password: string) => {
    if (username === creds.username && password === creds.password) {
      setAuth({ role: "admin", username });
      showToast("Admin dashboard unlocked.");
      return true;
    }
    const student = students.find(
      (s) => s.rollNo.toLowerCase() === username.toLowerCase() && s.rollNo === password
    );
    if (student) {
      setAuth({ role: "student", username: student.name, studentId: student.id });
      showToast(`Welcome, ${student.name}.`);
      return true;
    }
    return false;
  };

  const updateStudent = (student: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === student.id ? normalizeStudent(student) : s)));
    setProfile((p) => (p?.id === student.id ? normalizeStudent(student) : p));
  };

  const saveStudent = (student: Student) => {
    const normalized = normalizeStudent(student);
    setStudents((prev) =>
      prev.some((s) => s.id === normalized.id)
        ? prev.map((s) => (s.id === normalized.id ? normalized : s))
        : [normalized, ...prev]
    );
    setModalOpen(false);
    showToast(editing ? "Student record updated." : "New student enrolled.");
  };

  const deleteStudent = (student: Student) => {
    setStudents((prev) => prev.filter((s) => s.id !== student.id));
    setConfirmDelete(null);
    showToast("Student record removed.");
  };

  const approveAchievement = (studentId: string, achievementId: string, score: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const achievements = s.achievements.map((a) =>
          a.id === achievementId ? { ...a, status: "approved" as const, score } : a
        );
        return { ...s, achievements, score: Math.min(1000, s.score + score) };
      })
    );
    setProfile((p) => {
      if (!p || p.id !== studentId) return p;
      const achievements = p.achievements.map((a) =>
        a.id === achievementId ? { ...a, status: "approved" as const, score } : a
      );
      return { ...p, achievements, score: Math.min(1000, p.score + score) };
    });
    showToast("Achievement approved and score added.");
  };

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const text = `${s.name} ${s.rollNo} ${s.email}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesCourse = courseFilter === "All" || s.course === courseFilter;
      return matchesSearch && matchesCourse;
    });
  }, [students, search, courseFilter]);

  const stats = useMemo(() => {
    const total = students.length || 1;
    return {
      total: students.length,
      avgAttendance: Math.round(students.reduce((a, s) => a + s.attendance, 0) / total),
      totalFines: students.reduce((a, s) => a + s.fine, 0),
      finedCount: students.filter((s) => s.fine > 0).length,
      topScore: students.reduce((a, s) => Math.max(a, s.score), 0),
      pendingAchievements: students.reduce(
        (a, s) => a + s.achievements.filter((x) => x.status === "pending").length,
        0
      ),
    };
  }, [students]);

  if (!auth) return <Login onLogin={handleLogin} />;

  if (auth.role === "student") {
    const student = students.find((s) => s.id === auth.studentId);
    if (!student) return <Login onLogin={handleLogin} />;
    return (
      <StudentPortal
        student={student}
        className={className(student.classId)}
        onUpdate={updateStudent}
        onLogout={() => setAuth(null)}
        toast={toast}
      />
    );
  }

  const titles: Record<NavKey, { t: string; s: string }> = {
    dashboard: { t: "Dashboard", s: "Real-time overview of your campus" },
    students: { t: "Student Matrix", s: "Profiles, complaints, achievements and classes" },
    classes: { t: "Class Control", s: "Add, edit, delete and categorize student classes" },
    analytics: { t: "Analytics", s: "Performance and attendance insights" },
    fines: { t: "Fines Center", s: "Outstanding dues and penalties" },
    settings: { t: "Settings", s: "Security and account preferences" },
  };

  return (
    <div className="app-bg flex min-h-screen">
      <Sidebar active={nav} onNavigate={setNav} onLogout={() => setAuth(null)} username={auth.username} />
      <main className="relative flex-1 overflow-x-hidden">
        <header className="glass-soft sticky top-0 z-30 flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">{titles[nav].t}</h2>
            <p className="text-xs text-white/45 sm:text-sm">{titles[nav].s}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <SearchIcon width={17} height={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="w-44 rounded-xl bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/35 ring-1 ring-white/10 outline-none transition focus:w-60 focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/60" />
            </div>
            <button onClick={() => { setEditing(null); setModalOpen(true); }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/40 transition hover:-translate-y-0.5">
              <PlusIcon width={17} height={17} />
              <span className="hidden sm:inline">Add Student</span>
            </button>
          </div>
        </header>

        <div className="p-5 sm:p-8">
          {(nav === "dashboard" || nav === "analytics") && <StatGrid stats={stats} />}
          {nav === "dashboard" && <StudentSection title="Recent Profiles" students={filtered.slice(0, 6)} classes={classes} courseFilter={courseFilter} setCourseFilter={setCourseFilter} onView={setProfile} onEdit={(s) => { setEditing(s); setModalOpen(true); }} onDelete={setConfirmDelete} />}
          {nav === "students" && <StudentSection title="All Students" students={filtered} classes={classes} courseFilter={courseFilter} setCourseFilter={setCourseFilter} onView={setProfile} onEdit={(s) => { setEditing(s); setModalOpen(true); }} onDelete={setConfirmDelete} />}
          {nav === "classes" && <ClassesView classes={classes} students={students} onSave={setClasses} />}
          {nav === "analytics" && <AnalyticsView students={students} />}
          {nav === "fines" && <FinesView students={students} classes={classes} onView={setProfile} onEdit={(s) => { setEditing(s); setModalOpen(true); }} onDelete={setConfirmDelete} />}
          {nav === "settings" && <SettingsView creds={creds} onUpdate={(c) => { setCreds(c); showToast("Credentials updated successfully."); }} />}
        </div>
      </main>

      <StudentModal open={modalOpen} initial={editing} classes={classes} onClose={() => setModalOpen(false)} onSave={saveStudent} />
      {profile && <ProfilePanel student={students.find((s) => s.id === profile.id) || profile} className={className(profile.classId)} admin onClose={() => setProfile(null)} onUpdate={updateStudent} onApprove={approveAchievement} />}
      {confirmDelete && <DeleteConfirm student={confirmDelete} onCancel={() => setConfirmDelete(null)} onDelete={deleteStudent} />}
      {toast && <Toast text={toast} />}
    </div>
  );
}

function StudentPortal({ student, className, onUpdate, onLogout, toast }: { student: Student; className: string; onUpdate: (s: Student) => void; onLogout: () => void; toast: string | null }) {
  return (
    <div className="app-bg min-h-screen p-5 sm:p-8">
      <header className="glass-soft mb-6 flex items-center justify-between rounded-3xl p-4">
        <div className="flex items-center gap-3">
          <Avatar student={student} size="h-12 w-12" />
          <div>
            <h1 className="font-bold text-white">{student.name}</h1>
            <p className="text-xs text-white/45">Student Portal - {className}</p>
          </div>
        </div>
        <button onClick={onLogout} className="rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-rose-300 ring-1 ring-white/10 transition hover:bg-rose-500/20">Sign Out</button>
      </header>
      <ProfilePanel student={student} className={className} onUpdate={onUpdate} />
      {toast && <Toast text={toast} />}
    </div>
  );
}

function ProfilePanel({ student, className, admin = false, onClose, onUpdate, onApprove }: { student: Student; className: string; admin?: boolean; onClose?: () => void; onUpdate: (s: Student) => void; onApprove?: (studentId: string, achievementId: string, score: number) => void }) {
  const [complaint, setComplaint] = useState({ title: "", message: "" });
  const [achievement, setAchievement] = useState({ title: "", details: "" });

  const changePhoto = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpdate({ ...student, photo: String(reader.result) });
    reader.readAsDataURL(file);
  };
  const addComplaint = () => {
    if (!complaint.title.trim() || !complaint.message.trim()) return;
    onUpdate({ ...student, complaints: [{ id: `cmp-${Date.now()}`, title: complaint.title, message: complaint.message, date: new Date().toISOString().slice(0, 10) }, ...student.complaints] });
    setComplaint({ title: "", message: "" });
  };
  const addAchievement = () => {
    if (!achievement.title.trim() || !achievement.details.trim()) return;
    onUpdate({ ...student, achievements: [{ id: `ach-${Date.now()}`, title: achievement.title, details: achievement.details, date: new Date().toISOString().slice(0, 10), status: "pending" }, ...student.achievements] });
    setAchievement({ title: "", details: "" });
  };

  const content = (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="glass relative overflow-hidden rounded-3xl p-6 lg:col-span-1">
        {admin && onClose && <button onClick={onClose} className="absolute right-4 top-4 rounded-xl bg-white/5 p-2 text-white/60 ring-1 ring-white/10 hover:text-white"><XIcon width={18} height={18} /></button>}
        <div className="flex flex-col items-center text-center">
          <Avatar student={student} size="h-28 w-28" />
          {!admin && <label className="mt-4 cursor-pointer rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/40 transition hover:-translate-y-0.5">Change Photo<input type="file" accept="image/*" className="hidden" onChange={(e) => changePhoto(e.target.files?.[0])} /></label>}
          <h2 className="mt-4 text-2xl font-bold text-white">{student.name}</h2>
          <p className="font-mono text-sm text-indigo-300">{student.rollNo}</p>
          <p className="mt-1 text-sm text-white/50">{student.course}</p>
          <span className="mt-3 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300 ring-1 ring-cyan-400/30">{className}</span>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Metric label="Score" value={student.score} icon={<TrophyIcon width={16} height={16} />} />
          <Metric label="Fine" value={`$${student.fine}`} icon={<WalletIcon width={16} height={16} />} />
          <div className="glass-soft col-span-2 flex items-center justify-center rounded-2xl p-4"><AttendanceRing value={student.attendance} /></div>
        </div>
        <p className="mt-5 rounded-2xl bg-white/5 p-4 text-sm leading-relaxed text-white/55 ring-1 ring-white/10">{student.bio || "No profile bio added yet."}</p>
      </div>

      <div className="space-y-6 lg:col-span-2">
        {!admin && <Composer title="Campus Complaint" icon={<AlertIcon width={18} height={18} />} first="Complaint title" second="Explain the campus issue" data={complaint} setData={setComplaint} onSubmit={addComplaint} button="Submit Complaint" />}
        {!admin && <Composer title="Achievement Request" icon={<TrophyIcon width={18} height={18} />} first="Achievement title" second="Describe achievement proof/details" data={achievement} setData={setAchievement} onSubmit={addAchievement} button="Send for Approval" />}
        <ListBlock title="Campus Complaints" icon={<AlertIcon width={18} height={18} />} empty="No complaints submitted." items={student.complaints.map((c) => ({ id: c.id, title: c.title, sub: c.message, meta: c.date, badge: "Visible to Admin" }))} />
        <div className="glass rounded-3xl p-6">
          <div className="mb-4 flex items-center gap-2"><TrophyIcon width={18} height={18} className="text-amber-300" /><h3 className="font-bold text-white">Achievements</h3></div>
          <div className="space-y-3">
            {student.achievements.length === 0 && <p className="text-sm text-white/45">No achievements submitted.</p>}
            {student.achievements.map((a) => <AchievementRow key={a.id} achievement={a} admin={admin} onApprove={(score) => onApprove?.(student.id, a.id, score)} />)}
          </div>
        </div>
      </div>
    </div>
  );

  return admin ? <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"><div className="modal-pop mx-auto max-w-6xl">{content}</div></div> : content;
}

function Avatar({ student, size }: { student: Student; size: string }) {
  return <div className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br ${gradientFor(student.id)} text-2xl font-bold text-white shadow-xl`}>{student.photo ? <img src={student.photo} alt={student.name} className="h-full w-full object-cover" /> : initials(student.name)}</div>;
}

function Composer({ title, icon, first, second, data, setData, onSubmit, button }: { title: string; icon: React.ReactNode; first: string; second: string; data: { title: string; message?: string; details?: string }; setData: (d: any) => void; onSubmit: () => void; button: string }) {
  const bodyKey = "message" in data ? "message" : "details";
  return <div className="glass rounded-3xl p-6"><div className="mb-4 flex items-center gap-2 text-white">{icon}<h3 className="font-bold">{title}</h3></div><div className="space-y-3"><input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} placeholder={first} className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-indigo-400/60" /><textarea value={(data as any)[bodyKey]} onChange={(e) => setData({ ...data, [bodyKey]: e.target.value })} placeholder={second} className="min-h-24 w-full resize-none rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-indigo-400/60" /><button onClick={onSubmit} className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/40 transition hover:-translate-y-0.5"><PlusIcon width={16} height={16} className="mr-2 inline" />{button}</button></div></div>;
}

function AchievementRow({ achievement, admin, onApprove }: { achievement: Achievement; admin: boolean; onApprove: (score: number) => void }) {
  const [score, setScore] = useState(50);
  return <div className="glass-soft rounded-2xl p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="font-semibold text-white">{achievement.title}</h4><p className="mt-1 text-sm text-white/50">{achievement.details}</p><p className="mt-1 text-xs text-white/35">{achievement.date}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${achievement.status === "approved" ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30" : "bg-amber-500/15 text-amber-300 ring-amber-400/30"}`}>{achievement.status === "approved" ? `Approved +${achievement.score}` : "Pending"}</span></div>{admin && achievement.status === "pending" && <div className="mt-4 flex gap-2"><input type="number" min={0} max={300} value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-28 rounded-xl bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-white/10 outline-none" /><button onClick={() => onApprove(Math.max(0, Math.min(300, score)))} className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white">Approve & Add Score</button></div>}</div>;
}

function Metric({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return <div className="glass-soft rounded-2xl p-4"><div className="mb-2 text-indigo-300">{icon}</div><p className="text-xl font-bold text-white">{value}</p><p className="text-xs text-white/40">{label}</p></div>;
}

function ListBlock({ title, icon, empty, items }: { title: string; icon: React.ReactNode; empty: string; items: { id: string; title: string; sub: string; meta: string; badge: string }[] }) {
  return <div className="glass rounded-3xl p-6"><div className="mb-4 flex items-center gap-2 text-white">{icon}<h3 className="font-bold">{title}</h3></div><div className="space-y-3">{items.length === 0 && <p className="text-sm text-white/45">{empty}</p>}{items.map((i) => <div key={i.id} className="glass-soft rounded-2xl p-4"><div className="flex justify-between gap-3"><h4 className="font-semibold text-white">{i.title}</h4><span className="rounded-full bg-indigo-500/15 px-2 py-1 text-[10px] font-semibold text-indigo-300">{i.badge}</span></div><p className="mt-1 text-sm text-white/50">{i.sub}</p><p className="mt-1 text-xs text-white/35">{i.meta}</p></div>)}</div></div>;
}

function StudentSection({ title, students, classes, courseFilter, setCourseFilter, onView, onEdit, onDelete }: { title: string; students: Student[]; classes: ClassGroup[]; courseFilter: string; setCourseFilter: (s: string) => void; onView: (s: Student) => void; onEdit: (s: Student) => void; onDelete: (s: Student) => void }) {
  const className = (id: string) => classes.find((c) => c.id === id)?.name || "No Class";
  return <><SectionHeader title={title} count={students.length} courseFilter={courseFilter} setCourseFilter={setCourseFilter} /><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{students.map((s, i) => <StudentCard key={s.id} student={s} index={i} className={className(s.classId)} onView={onView} onEdit={onEdit} onDelete={onDelete} />)}</div></>;
}

function SectionHeader({ title, count, courseFilter, setCourseFilter }: { title: string; count: number; courseFilter: string; setCourseFilter: (s: string) => void }) {
  return <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><h3 className="text-lg font-bold text-white">{title}</h3><span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-400/30">{count}</span></div><div className="relative flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10"><FilterIcon width={15} height={15} className="text-white/40" /><select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="bg-transparent text-sm text-white/80 outline-none"><option value="All" className="bg-slate-900">All Courses</option>{COURSES.map((c) => <option key={c} value={c} className="bg-slate-900">{c}</option>)}</select></div></div>;
}

function StatGrid({ stats }: { stats: { total: number; avgAttendance: number; totalFines: number; finedCount: number; topScore: number; pendingAchievements: number } }) {
  const cards = [{ label: "Students", value: stats.total, icon: StudentsIcon, grad: "from-indigo-500 to-violet-600", sub: "Registered accounts" }, { label: "Attendance", value: `${stats.avgAttendance}%`, icon: TrendUpIcon, grad: "from-emerald-500 to-teal-600", sub: "Average" }, { label: "Fines", value: `$${stats.totalFines}`, icon: WalletIcon, grad: "from-rose-500 to-red-600", sub: `${stats.finedCount} flagged` }, { label: "Pending Achievements", value: stats.pendingAchievements, icon: TrophyIcon, grad: "from-amber-400 to-orange-500", sub: `Top score ${stats.topScore}` }];
  return <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((c, i) => <div key={c.label} className="glass card-hover float-in relative overflow-hidden rounded-3xl p-5" style={{ animationDelay: `${i * 70}ms` }}><div className={`absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${c.grad} opacity-30 blur-2xl`} /><div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${c.grad} text-white shadow-lg`}><c.icon width={22} height={22} /></div><p className="mt-4 text-3xl font-bold text-white">{c.value}</p><p className="mt-1 text-sm font-medium text-white/70">{c.label}</p><p className="text-xs text-white/40">{c.sub}</p></div>)}</div>;
}

function ClassesView({ classes, students, onSave }: { classes: ClassGroup[]; students: Student[]; onSave: (c: ClassGroup[]) => void }) {
  const [form, setForm] = useState<ClassGroup>({ id: "", name: "", mentor: "", room: "" });
  const save = () => { if (!form.name.trim()) return; onSave(form.id ? classes.map((c) => c.id === form.id ? form : c) : [{ ...form, id: `class-${Date.now()}` }, ...classes]); setForm({ id: "", name: "", mentor: "", room: "" }); };
  const remove = (id: string) => onSave(classes.length <= 1 ? classes : classes.filter((c) => c.id !== id));
  return <div className="grid grid-cols-1 gap-6 lg:grid-cols-3"><div className="glass rounded-3xl p-6"><h3 className="mb-4 flex items-center gap-2 font-bold text-white"><BookIcon width={18} height={18} />Class Editor</h3><div className="space-y-3"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Class name" className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none" /><input value={form.mentor} onChange={(e) => setForm({ ...form, mentor: e.target.value })} placeholder="Mentor" className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none" /><input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Room" className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none" /><button onClick={save} className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-2.5 text-sm font-semibold text-white">{form.id ? "Save Class" : "Add Class"}</button></div></div><div className="grid gap-4 lg:col-span-2">{classes.map((c) => <div key={c.id} className="glass card-hover flex flex-wrap items-center gap-4 rounded-3xl p-5"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white"><BookIcon /></div><div className="min-w-0 flex-1"><h4 className="font-bold text-white">{c.name}</h4><p className="text-sm text-white/45">{c.mentor} - {c.room}</p><p className="text-xs text-indigo-300">{students.filter((s) => s.classId === c.id).length} students categorized</p></div><button onClick={() => setForm(c)} className="rounded-xl bg-white/5 p-2 text-indigo-300 ring-1 ring-white/10"><EditIcon width={16} height={16} /></button><button onClick={() => remove(c.id)} className="rounded-xl bg-white/5 p-2 text-rose-300 ring-1 ring-white/10"><TrashIcon width={16} height={16} /></button></div>)}</div></div>;
}

function AnalyticsView({ students }: { students: Student[] }) {
  const ranked = [...students].sort((a, b) => b.score - a.score).slice(0, 6);
  return <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><div className="glass rounded-3xl p-6"><h3 className="mb-5 flex items-center gap-2 font-bold text-white"><AnalyticsIcon width={18} height={18} />Top Performers</h3><div className="space-y-3">{ranked.map((s, i) => <div key={s.id} className="glass-soft flex items-center gap-3 rounded-2xl p-3"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 font-bold text-white">{i + 1}</span><Avatar student={s} size="h-10 w-10" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{s.name}</p><p className="text-xs text-white/40">{s.course}</p></div><span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">{s.score}</span></div>)}</div></div><div className="glass rounded-3xl p-6"><h3 className="mb-5 font-bold text-white">Attendance Rings</h3><div className="flex flex-wrap gap-6">{students.slice(0, 8).map((s) => <div key={s.id} className="flex flex-col items-center gap-2"><AttendanceRing value={s.attendance} size={68} stroke={7} /><span className="max-w-[68px] truncate text-xs text-white/50">{s.name.split(" ")[0]}</span></div>)}</div></div></div>;
}

function FinesView({ students, classes, onView, onEdit, onDelete }: { students: Student[]; classes: ClassGroup[]; onView: (s: Student) => void; onEdit: (s: Student) => void; onDelete: (s: Student) => void }) {
  const fined = students.filter((s) => s.fine > 0).sort((a, b) => b.fine - a.fine);
  const className = (id: string) => classes.find((c) => c.id === id)?.name || "No Class";
  return <div>{fined.length === 0 ? <div className="glass rounded-3xl p-12 text-center text-white/55">No outstanding fines.</div> : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{fined.map((s, i) => <StudentCard key={s.id} student={s} index={i} className={className(s.classId)} onView={onView} onEdit={onEdit} onDelete={onDelete} />)}</div>}</div>;
}

function SettingsView({ creds, onUpdate }: { creds: Creds; onUpdate: (c: Creds) => void }) {
  const [username, setUsername] = useState(creds.username);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState("");
  return <div className="glass max-w-2xl rounded-3xl p-6"><h3 className="mb-5 flex items-center gap-2 font-bold text-white"><KeyIcon width={18} height={18} />Admin Credentials</h3><div className="space-y-4"><input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none" /><input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none" /><input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password" className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none" />{msg && <p className="text-sm text-rose-300">{msg}</p>}<button onClick={() => { if (current !== creds.password) return setMsg("Current password is incorrect."); onUpdate({ username, password: next || creds.password }); setMsg("Saved."); }} className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white"><SaveIcon width={16} height={16} className="mr-2 inline" />Save Changes</button></div><p className="mt-5 text-xs text-white/40">Student login: username is Roll No. and password is the same Roll No. Example: CS-2041 / CS-2041.</p></div>;
}

function DeleteConfirm({ student, onCancel, onDelete }: { student: Student; onCancel: () => void; onDelete: (s: Student) => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"><div className="modal-pop glass max-w-sm rounded-3xl p-6 text-center"><AlertIcon width={34} height={34} className="mx-auto text-rose-300" /><h3 className="mt-4 text-lg font-bold text-white">Delete Student?</h3><p className="mt-1 text-sm text-white/55">Remove {student.name} permanently.</p><div className="mt-6 flex gap-3"><button onClick={onCancel} className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-semibold text-white/70 ring-1 ring-white/10">Cancel</button><button onClick={() => onDelete(student)} className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 py-2.5 text-sm font-semibold text-white">Delete</button></div></div></div>;
}

function Toast({ text }: { text: string }) {
  return <div className="modal-pop fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-emerald-600/40"><CheckCircleIcon width={18} height={18} />{text}</div>;
}