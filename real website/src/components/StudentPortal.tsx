import { useState } from "react";
import { type Student, gradientFor, initials } from "../data";
import AttendanceRing from "./AttendanceRing";
import { LogoutIcon, MailIcon, BookIcon, TrophyIcon, AlertIcon, CheckCircleIcon, KeyIcon, SaveIcon } from "../icons";

type Props = {
  student: Student;
  onLogout: () => void;
  onPasswordChange: (id: string, pass: string) => void;
};

export default function StudentPortal({ student, onLogout, onPasswordChange }: Props) {
  const grad = gradientFor(student.id);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const field =
    "w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 ring-1 ring-white/10 outline-none transition focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/60";
  const label = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/45";

  const scorePct = Math.min(100, Math.round((student.score / 1000) * 100));

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setMsg({ ok: false, text: "Passwords do not match." });
      return;
    }
    onPasswordChange(student.id, newPass);
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
    setMsg({ ok: true, text: "Password updated! Remember it for next login." });
  };

  return (
    <div className="app-bg flex min-h-screen flex-col">
      {/* top bar */}
      <header className="glass-soft flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-base font-bold text-white shadow-lg`}
          >
            {initials(student.name)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{student.name}</h2>
            <p className="text-xs text-white/45">{student.rollNo}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/70 ring-1 ring-white/10 transition hover:bg-rose-500/20 hover:text-white"
        >
          <LogoutIcon width={17} height={17} />
          Sign Out
        </button>
      </header>

      <main className="flex-1 p-5 sm:p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* profile card */}
          <div className="glass card-hover float-in rounded-3xl p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <AttendanceRing value={student.attendance} />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <BookIcon width={16} height={16} className="text-indigo-300" />
                  <span className="text-sm text-white/70">{student.course}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MailIcon width={16} height={16} className="text-sky-300" />
                  <span className="text-sm text-white/60">{student.email}</span>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs font-medium uppercase tracking-wider text-white/40">
                    <span>Milestone Progress</span>
                    <span>{scorePct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-1000"
                      style={{ width: `${scorePct}%` }}
                    />
                  </div>
                </div>
              </div>
              <div
                className={`score-glow flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400/90 to-yellow-300/90 px-4 py-2 text-sm font-bold text-amber-950`}
              >
                <TrophyIcon width={16} height={16} />
                {student.score} pts
              </div>
            </div>
          </div>

          {/* fine status */}
          <div className="glass float-in rounded-3xl p-6" style={{ animationDelay: "100ms" }}>
            <h3 className="mb-3 text-base font-bold text-white">Financial Status</h3>
            {student.fine > 0 ? (
              <div className="alert-pulse flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 px-4 py-4 text-white">
                <AlertIcon width={24} height={24} />
                <div>
                  <p className="text-sm font-semibold">Outstanding Fine</p>
                  <p className="text-2xl font-bold">${student.fine}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 rounded-2xl bg-emerald-500/15 px-4 py-4 text-emerald-300 ring-1 ring-emerald-400/30">
                <CheckCircleIcon width={24} height={24} />
                <p className="text-sm font-semibold">No Outstanding Dues</p>
              </div>
            )}
          </div>

          {/* change password */}
          <div className="glass float-in rounded-3xl p-6" style={{ animationDelay: "200ms" }}>
            <div className="mb-4 flex items-center gap-2">
              <KeyIcon width={18} height={18} className="text-indigo-300" />
              <h3 className="text-base font-bold text-white">Change Password</h3>
            </div>
            <form onSubmit={changePassword} className="space-y-3">
              <div>
                <label className={label}>Current Password</label>
                <input
                  type="password"
                  className={field}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={label}>New Password</label>
                  <input
                    type="password"
                    className={field}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className={label}>Confirm New</label>
                  <input
                    type="password"
                    className={field}
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
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
                Save Password
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}