import { Link } from "react-router-dom";
import { Terminal } from "lucide-react";
import { AuthLayout } from "../../components/AuthLayout/index.tsx";
import { Input } from "../../components/Input/index.tsx";
import { Button } from "../../components/Button/index.tsx";
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
    loading,
    handleRequest,
    handleConfirm,
  } = useRecoverPassword();

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        step === "request"
          ? "We'll send a recovery code to your email."
          : "Enter the code you received and pick a new password."
      }
      footer={
        <Link to="/login" className="border-b border-rule text-ink no-underline hover:border-accent hover:text-accent">
          Back to login
        </Link>
      }
    >
      {message && (
        <div className="mb-6 flex items-start gap-2.5 rounded-sm border border-rule bg-paper-dim px-3.5 py-3">
          <Terminal className="mt-0.5 size-4 shrink-0 text-ink-soft" aria-hidden="true" />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Demo mode</p>
            <p className="mt-0.5 font-sans text-[13px] text-ink-soft">{message}</p>
          </div>
        </div>
      )}

      {step === "request" ? (
        <form className="flex flex-col gap-5" onSubmit={handleRequest}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          {error && (
            <p role="alert" className="border-l-2 border-error bg-error-bg px-2.5 py-2 font-mono text-[13px] text-error">
              {error}
            </p>
          )}

          <Button type="submit" className="mt-2" loading={loading}>
            Send recovery code
          </Button>
        </form>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={handleConfirm}>
          <Input label="Recovery code" type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          {error && (
            <p role="alert" className="border-l-2 border-error bg-error-bg px-2.5 py-2 font-mono text-[13px] text-error">
              {error}
            </p>
          )}

          <Button type="submit" className="mt-2" loading={loading}>
            Reset password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
