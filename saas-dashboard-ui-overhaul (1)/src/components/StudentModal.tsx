import { useEffect, useState } from "react";
import { COURSES, type Student } from "../data";
import { PlusIcon, SaveIcon, XIcon } from "../icons";

type Props = {
  open: boolean;
  initial: Student | null;
  onClose: () => void;
  onSave: (s: Student) => void;
};

const blank = (): Student => ({
  id: "",
  name: "",
  rollNo: "",
  course: COURSES[0],
  email: "",
  attendance: 80,
  fine: 0,
  score: 500,
});

export default function StudentModal({ open, initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<Student>(blank());
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : blank());
      setError("");
    }
  }, [open, initial]);

  if (!open) return null;

  const isEdit = Boolean(initial);

  const submit = () => {
    if (!form.name.trim() || !form.rollNo.trim()) {
      setError("Name and Roll No. are required.");
      return;
    }
    onSave({
      ...form,
      id: form.id || `stu-${Date.now()}`,
      attendance: Math.max(0, Math.min(100, Number(form.attendance) || 0)),
      fine: Math.max(0, Number(form.fine) || 0),
      score: Math.max(0, Math.min(1000, Number(form.score) || 0)),
    });
  };

  const field =
    "w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 ring-1 ring-white/10 outline-none transition focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/60";
  const label = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/45";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="modal-pop glass relative w-full max-w-lg overflow-hidden rounded-3xl p-6 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 opacity-30 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
              {isEdit ? <SaveIcon /> : <PlusIcon />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isEdit ? "Edit Student" : "Enroll New Student"}
              </h2>
              <p className="text-xs text-white/45">
                {isEdit ? "Update the record details" : "Add a profile to the matrix"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/60 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
          >
            <XIcon width={18} height={18} />
          </button>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={label}>Full Name</label>
            <input
              className={field}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Ava Thompson"
            />
          </div>
          <div>
            <label className={label}>Roll No.</label>
            <input
              className={field}
              value={form.rollNo}
              onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
              placeholder="CS-2041"
            />
          </div>
          <div>
            <label className={label}>Course</label>
            <select
              className={field}
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
            >
              {COURSES.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className={label}>Email</label>
            <input
              className={field}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@edupulse.io"
            />
          </div>
          <div>
            <label className={label}>Attendance: {form.attendance}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={form.attendance}
              onChange={(e) => setForm({ ...form, attendance: Number(e.target.value) })}
              className="mt-2 w-full accent-indigo-400"
            />
          </div>
          <div>
            <label className={label}>Score: {form.score}</label>
            <input
              type="range"
              min={0}
              max={1000}
              step={10}
              value={form.score}
              onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
              className="mt-2 w-full accent-amber-400"
            />
          </div>
          <div className="col-span-2">
            <label className={label}>Outstanding Fine ($)</label>
            <input
              type="number"
              min={0}
              className={field}
              value={form.fine}
              onChange={(e) => setForm({ ...form, fine: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
        </div>

        {error && (
          <p className="relative mt-4 rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-medium text-rose-300 ring-1 ring-rose-400/30">
            {error}
          </p>
        )}

        <div className="relative mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-white/70 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/40 transition hover:-translate-y-0.5 hover:shadow-indigo-500/60"
          >
            {isEdit ? <SaveIcon width={16} height={16} /> : <PlusIcon width={16} height={16} />}
            {isEdit ? "Save Changes" : "Enroll Student"}
          </button>
        </div>
      </div>
    </div>
  );
}
