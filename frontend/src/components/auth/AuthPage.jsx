import { useState } from "react";
import { motion } from "framer-motion";
import { FiLock, FiLogIn, FiUserPlus, FiUsers } from "react-icons/fi";
import { loginUser, registerUser } from "../../services/api.js";
import GlassPanel from "../ui/GlassPanel.jsx";

const emptyForm = {
  username: "",
  password: "",
  fullname: "",
  age: "",
  gender: "Female",
  confirmPassword: "",
};

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegister) {
        await registerUser({ ...form, age: Number(form.age) });
        setMode("login");
        setSuccess("Account created. Log in to continue.");
        setForm((current) => ({ ...emptyForm, username: current.username }));
        return;
      }

      const session = await loginUser({ username: form.username, password: form.password });
      onAuthenticated(session);
    } catch (exception) {
      setError(exception.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--page-bg)] text-[var(--text-primary)] transition-colors duration-500">
      <div className="ambient-bg" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />

      <section className="relative z-10 grid min-h-screen place-items-center px-4 py-8">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_440px] lg:items-center">
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid h-16 w-16 place-items-center rounded-[24px] bg-[var(--accent)] text-2xl font-black text-white shadow-glow"
            >
              B
            </motion.div>
            <div className="max-w-xl space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Beacon Access</p>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl">Login first, then join the live chat.</h1>
              <p className="text-base leading-7 text-[var(--text-secondary)]">
                Only registered users can open the workspace. New users need a name, age, gender, username, and password before they can chat.
              </p>
            </div>
            <div className="grid max-w-xl gap-3 sm:grid-cols-3">
              {["Stored users", "Private login", "15 day cleanup"].map((item) => (
                <div key={item} className="rounded-[20px] border border-[var(--glass-border)] bg-[var(--glass-soft)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <GlassPanel className="p-5 sm:p-6">
            <div className="mb-5 flex rounded-[20px] border border-[var(--glass-border)] bg-[var(--glass-soft)] p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                  !isRegister ? "bg-white text-slate-950 shadow-lg" : "text-[var(--text-secondary)]"
                }`}
              >
                <FiLogIn /> Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccess("");
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                  isRegister ? "bg-white text-slate-950 shadow-lg" : "text-[var(--text-secondary)]"
                }`}
              >
                <FiUserPlus /> Create
              </button>
            </div>

            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent)] text-white">
                {isRegister ? <FiUsers /> : <FiLock />}
              </div>
              <div>
                <h2 className="text-xl font-bold">{isRegister ? "Create user" : "Welcome back"}</h2>
                <p className="text-sm text-[var(--text-muted)]">{isRegister ? "Add a new allowed user." : "Use an existing username."}</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={submit}>
              {isRegister && (
                <>
                  <Field label="Full name" value={form.fullname} onChange={(value) => updateField("fullname", value)} autoComplete="name" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Age" type="number" value={form.age} onChange={(value) => updateField("age", value)} min="1" max="120" />
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-muted)]">Gender</span>
                      <select
                        value={form.gender}
                        onChange={(event) => updateField("gender", event.target.value)}
                        className="h-12 w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--composer-bg)] px-4 text-sm text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
                      >
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                      </select>
                    </label>
                  </div>
                </>
              )}

              <Field label="Username" value={form.username} onChange={(value) => updateField("username", value)} autoComplete="username" />
              <Field label="Password" type="password" value={form.password} onChange={(value) => updateField("password", value)} autoComplete={isRegister ? "new-password" : "current-password"} />
              {isRegister && <Field label="Confirm password" type="password" value={form.confirmPassword} onChange={(value) => updateField("confirmPassword", value)} autoComplete="new-password" />}

              {success && (
                <div className="rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  {success}
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] text-sm font-bold text-white shadow-glow outline-none transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
              >
                {loading ? "Please wait..." : isRegister ? "Create user" : "Login to chat"}
              </motion.button>
            </form>
          </GlassPanel>
        </div>
      </section>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-muted)]">{label}</span>
      <input
        {...props}
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--composer-bg)] px-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
      />
    </label>
  );
}
