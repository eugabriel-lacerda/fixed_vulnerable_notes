import { Link } from "react-router-dom";
import { useLogin } from "./index.ts";

export function Login() {
  const { email, setEmail, password, setPassword, error, handleSubmit } = useLogin();

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-6 py-12">
      <Link to="/login" className="absolute top-12 left-1/2 -translate-x-1/2 font-display text-xl font-medium text-ink no-underline">
        Vuln Notes
      </Link>

      <div className="w-full max-w-95">
        <h1 className="font-display text-[28px] font-medium italic">Welcome back</h1>
        <p className="mb-8 mt-2 font-sans text-sm text-ink-soft">Pick up where you left off.</p>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="group relative flex flex-col gap-1.5">
            <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="border-0 border-b border-rule bg-transparent px-0.5 pb-2.5 pt-1.5 font-sans text-[15px] text-ink outline-none focus-visible:outline-none focus:border-transparent"
            />
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-focus-within:scale-x-100"
            />
          </div>

          <div className="group relative flex flex-col gap-1.5">
            <label htmlFor="password" className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="border-0 border-b border-rule bg-transparent px-0.5 pb-2.5 pt-1.5 font-sans text-[15px] text-ink outline-none focus-visible:outline-none focus:border-transparent"
            />
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-focus-within:scale-x-100"
            />
          </div>

          {error && (
            <p role="alert" className="border-l-2 border-error bg-error-bg px-2.5 py-2 font-mono text-[13px] text-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-sm bg-ink px-5 py-3 font-sans text-[15px] font-semibold text-paper transition-colors hover:bg-accent active:bg-accent-dark"
          >
            Log in
          </button>
        </form>

        <div className="mt-7 flex flex-col gap-2.5 text-sm text-ink-soft">
          <Link to="/recover-password" className="border-b border-rule text-ink no-underline hover:border-accent hover:text-accent">
            Forgot your password?
          </Link>
          <span>
            New here?{" "}
            <Link to="/register" className="border-b border-rule text-ink no-underline hover:border-accent hover:text-accent">
              Create an account
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
