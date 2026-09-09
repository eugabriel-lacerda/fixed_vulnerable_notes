import { Link } from "react-router-dom";
import { useRecoverPassword } from "./index.ts";

export function RecoverPassword() {
  const {
    step,
    email,
    setEmail,
    code,
    setCode,
    newPassword,
    setNewPassword,
    error,
    message,
    handleRequest,
    handleConfirm,
  } = useRecoverPassword();

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-6 py-12">
      <Link to="/login" className="absolute top-12 left-1/2 -translate-x-1/2 font-display text-xl font-medium text-ink no-underline">
        Vuln Notes
      </Link>

      <div className="w-full max-w-95">
        <h1 className="font-display text-[28px] font-medium italic">Reset your password</h1>
        <p className="mb-8 mt-2 font-sans text-sm text-ink-soft">
          {step === "request"
            ? "We'll send a recovery code to your email."
            : "Enter the code you received and pick a new password."}
        </p>

        {message && (
          <p className="mb-6 font-mono text-[13px] text-accent">{message}</p>
        )}

        {step === "request" ? (
          <form className="flex flex-col gap-5" onSubmit={handleRequest}>
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

            {error && (
              <p role="alert" className="border-l-2 border-error bg-error-bg px-2.5 py-2 font-mono text-[13px] text-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-2 rounded-sm bg-ink px-5 py-3 font-sans text-[15px] font-semibold text-paper transition-colors hover:bg-accent active:bg-accent-dark"
            >
              Send recovery code
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={handleConfirm}>
            <div className="group relative flex flex-col gap-1.5">
              <label htmlFor="code" className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                Recovery code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="border-0 border-b border-rule bg-transparent px-0.5 pb-2.5 pt-1.5 font-sans text-[15px] text-ink outline-none focus-visible:outline-none focus:border-transparent"
              />
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-focus-within:scale-x-100"
              />
            </div>

            <div className="group relative flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
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
              Reset password
            </button>
          </form>
        )}

        <div className="mt-7 flex flex-col gap-2.5 text-sm text-ink-soft">
          <Link to="/login" className="border-b border-rule text-ink no-underline hover:border-accent hover:text-accent">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
