export type Student = {
  id: string;
  name: string;
  rollNo: string;
  course: string;
  email: string;
  attendance: number; // 0 - 100
  fine: number; // currency amount
  score: number; // milestone score 0 - 1000
  classId: string;
  photo?: string;
  bio?: string;
  phone?: string;
  complaints: Complaint[];
  achievements: Achievement[];
};

export type ClassGroup = {
  id: string;
  name: string;
  mentor: string;
  room: string;
};

export type Complaint = {
  id: string;
  title: string;
  message: string;
  date: string;
};

export type Achievement = {
  id: string;
  title: string;
  details: string;
  date: string;
  status: "pending" | "approved";
  score?: number;
};

export const COURSES = [
  "Computer Science",
  "Data Science",
  "Mechanical Eng.",
  "Business Admin",
  "Graphic Design",
  "Electrical Eng.",
  "Psychology",
];

export const SEED_CLASSES: ClassGroup[] = [
  { id: "class-first", name: "First Class", mentor: "Dr. Elena Brooks", room: "Block A - 201" },
  { id: "class-second", name: "Second Class", mentor: "Prof. Arun Menon", room: "Block B - 104" },
];

export const SEED_STUDENTS: Student[] = [
  { id: "stu-1", name: "Ava Thompson", rollNo: "CS-2041", course: "Computer Science", email: "ava.t@edupulse.io", attendance: 94, fine: 0, score: 880, classId: "class-first", phone: "+1 555 0101", bio: "Frontend specialist and coding club lead.", complaints: [], achievements: [{ id: "ach-1", title: "Hackathon Winner", details: "Won the campus innovation hackathon.", date: "2026-01-05", status: "approved", score: 120 }] },
  { id: "stu-2", name: "Liam Carter", rollNo: "DS-1185", course: "Data Science", email: "liam.c@edupulse.io", attendance: 76, fine: 45, score: 640, classId: "class-second", phone: "+1 555 0102", bio: "Data visualization enthusiast.", complaints: [{ id: "cmp-1", title: "Lab Wi-Fi issue", message: "Data lab Wi-Fi drops during practical sessions.", date: "2026-01-11" }], achievements: [] },
  { id: "stu-3", name: "Sofia Martinez", rollNo: "BA-3320", course: "Business Admin", email: "sofia.m@edupulse.io", attendance: 88, fine: 0, score: 720, classId: "class-first", complaints: [], achievements: [{ id: "ach-2", title: "Debate finalist", details: "Reached final round in intercollege debate.", date: "2026-01-13", status: "pending" }] },
  { id: "stu-4", name: "Noah Patel", rollNo: "ME-0907", course: "Mechanical Eng.", email: "noah.p@edupulse.io", attendance: 61, fine: 120, score: 410, classId: "class-second", complaints: [], achievements: [] },
  { id: "stu-5", name: "Emma Wilson", rollNo: "GD-5512", course: "Graphic Design", email: "emma.w@edupulse.io", attendance: 97, fine: 0, score: 950, classId: "class-first", complaints: [], achievements: [] },
  { id: "stu-6", name: "Kai Nguyen", rollNo: "EE-4408", course: "Electrical Eng.", email: "kai.n@edupulse.io", attendance: 82, fine: 30, score: 580, classId: "class-second", complaints: [], achievements: [] },
  { id: "stu-7", name: "Olivia Brooks", rollNo: "PS-2261", course: "Psychology", email: "olivia.b@edupulse.io", attendance: 90, fine: 0, score: 810, classId: "class-first", complaints: [], achievements: [] },
  { id: "stu-8", name: "Ethan Reed", rollNo: "CS-2099", course: "Computer Science", email: "ethan.r@edupulse.io", attendance: 54, fine: 200, score: 320, classId: "class-second", complaints: [], achievements: [] },
];

export function normalizeStudent(student: Partial<Student>, index = 0): Student {
  const id = student.id || `stu-${Date.now()}-${index}`;
  return {
    id,
    name: student.name || "Unnamed Student",
    rollNo: student.rollNo || `ST-${index + 1}`,
    course: student.course || COURSES[0],
    email: student.email || "",
    attendance: Number(student.attendance ?? 80),
    fine: Number(student.fine ?? 0),
    score: Number(student.score ?? 500),
    classId: student.classId || (index % 2 === 0 ? "class-first" : "class-second"),
    photo: student.photo || "",
    bio: student.bio || "",
    phone: student.phone || "",
    complaints: Array.isArray(student.complaints) ? student.complaints : [],
    achievements: Array.isArray(student.achievements) ? student.achievements : [],
  };
}

export const AVATAR_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-cyan-600",
  "from-fuchsia-500 to-purple-600",
  "from-lime-500 to-green-600",
];

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function gradientFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

export function scoreTier(score: number): { label: string; ring: string } {
  if (score >= 850) return { label: "Diamond", ring: "ring-cyan-300/60" };
  if (score >= 700) return { label: "Gold", ring: "ring-amber-300/60" };
  if (score >= 500) return { label: "Silver", ring: "ring-slate-200/60" };
  return { label: "Bronze", ring: "ring-orange-400/60" };
}
