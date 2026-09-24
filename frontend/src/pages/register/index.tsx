import { Link } from "react-router-dom";
import { AuthLayout } from "../../components/AuthLayout/index.tsx";
import { Input } from "../../components/Input/index.tsx";
import { Button } from "../../components/Button/index.tsx";
import { useRegister } from "./index.ts";

export function Register() {
  const { email, setEmail, password, setPassword, error, loading, handleSubmit } = useRegister();

  return (
    <AuthLayout
      title="Start writing"
      subtitle="A quiet place to keep your notes."
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/login" className="border-b border-rule text-ink no-underline hover:border-accent hover:text-accent">
            Log in
          </Link>
        </span>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        {error && (
          <p role="alert" className="border-l-2 border-error bg-error-bg px-2.5 py-2 font-mono text-[13px] text-error">
            {error}
          </p>
        )}

        <Button type="submit" className="mt-2" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
