import { useState } from "react";
import { EyeIcon, EyeOffIcon, KeyIcon, LockIcon, ShieldIcon, UserIcon } from "../icons";

type Props = {
  onLogin: (username: string, password: string) => boolean;
};

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onLogin(username.trim(), password);
    if (!ok) {
      setError("Invalid credentials. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const field =
    "w-full rounded-xl bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-white/35 ring-1 ring-white/10 outline-none transition focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/60";

  return (
    <div className="app-bg flex min-h-screen items-center justify-center p-4">
      <div
        className={`glass float-in relative w-full max-w-md overflow-hidden rounded-3xl p-8 shadow-2xl ${
          shake ? "animate-[modalPop_0.4s]" : ""
        }`}
        style={shake ? { animation: "alertPulse 0.4s 2" } : undefined}
      >
        <div className="spin-slow absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 opacity-25 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-600/40">
            <ShieldIcon width={30} height={30} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-white">EduPulse Suite</h1>
          <p className="mt-1 text-sm text-white/50">
            Secure access to your student command center
          </p>
        </div>

        <form onSubmit={submit} className="relative mt-8 space-y-4">
          <div className="relative">
            <UserIcon
              width={18}
              height={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              className={field}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <LockIcon
              width={18}
              height={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              className={field}
              type={show ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
            >
              {show ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
            </button>
          </div>

          {error && (
            <p className="rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-medium text-rose-300 ring-1 ring-rose-400/30">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/40 transition hover:-translate-y-0.5 hover:shadow-indigo-500/60"
          >
            <KeyIcon width={18} height={18} />
            Authenticate
          </button>
        </form>

        <div className="relative mt-6 rounded-xl bg-white/5 px-4 py-3 text-center text-xs text-white/40 ring-1 ring-white/10">
          Demo credentials —{" "}
          <span className="font-mono text-indigo-300">admin</span> /{" "}
          <span className="font-mono text-indigo-300">admin123</span>
        </div>
      </div>
    </div>
  );
}
