import { type Student, gradientFor, initials, scoreTier } from "../data";
import AttendanceRing from "./AttendanceRing";
import {
  AlertIcon,
  BookIcon,
  CheckCircleIcon,
  EditIcon,
  HashIcon,
  MailIcon,
  TrashIcon,
  TrophyIcon,
} from "../icons";

type Props = {
  student: Student;
  index: number;
  onEdit: (s: Student) => void;
  onDelete: (s: Student) => void;
};

export default function StudentCard({ student, index, onEdit, onDelete }: Props) {
  const grad = gradientFor(student.id);
  const tier = scoreTier(student.score);
  const hasFine = student.fine > 0;
  const scorePct = Math.min(100, Math.round((student.score / 1000) * 100));

  return (
    <div
      className="glass card-hover float-in group relative overflow-hidden rounded-3xl p-5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* decorative gradient blob */}
      <div
        className={`pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${grad} opacity-25 blur-2xl transition-opacity duration-500 group-hover:opacity-50`}
      />

      {/* header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-base font-bold text-white shadow-lg`}
          >
            {initials(student.name)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white">
              {student.name}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
              <HashIcon width={12} height={12} />
              <span className="font-mono">{student.rollNo}</span>
            </div>
          </div>
        </div>
        <AttendanceRing value={student.attendance} />
      </div>

      {/* meta */}
      <div className="relative mt-4 grid grid-cols-1 gap-2">
        <div className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-white/70">
          <BookIcon width={14} height={14} className="text-indigo-300" />
          <span className="truncate">{student.course}</span>
        </div>
        <div className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-white/60">
          <MailIcon width={14} height={14} className="text-sky-300" />
          <span className="truncate">{student.email}</span>
        </div>
      </div>

      {/* score milestone + fine */}
      <div className="relative mt-4 flex items-center justify-between gap-2">
        <div
          className={`score-glow flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400/90 to-yellow-300/90 px-3 py-1.5 text-xs font-bold text-amber-950 ring-2 ${tier.ring}`}
        >
          <TrophyIcon width={14} height={14} />
          <span>{student.score}</span>
          <span className="rounded-full bg-amber-950/15 px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
            {tier.label}
          </span>
        </div>

        {hasFine ? (
          <div className="alert-pulse flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-red-500 px-3 py-1.5 text-xs font-bold text-white">
            <AlertIcon width={14} height={14} />
            <span>${student.fine}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
            <CheckCircleIcon width={14} height={14} />
            <span>Clear</span>
          </div>
        )}
      </div>

      {/* score progress bar */}
      <div className="relative mt-3">
        <div className="mb-1 flex justify-between text-[10px] font-medium uppercase tracking-wider text-white/40">
          <span>Milestone Progress</span>
          <span>{scorePct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-1000"
            style={{ width: `${scorePct}%` }}
          />
        </div>
      </div>

      {/* actions */}
      <div className="relative mt-5 flex gap-2">
        <button
          onClick={() => onEdit(student)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-white/80 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-500/20 hover:text-white hover:shadow-lg hover:shadow-indigo-500/30 hover:ring-indigo-400/50"
        >
          <EditIcon width={15} height={15} />
          Edit
        </button>
        <button
          onClick={() => onDelete(student)}
          className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-rose-300 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-rose-500/20 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 hover:ring-rose-400/50"
        >
          <TrashIcon width={15} height={15} />
        </button>
      </div>
    </div>
  );
}
