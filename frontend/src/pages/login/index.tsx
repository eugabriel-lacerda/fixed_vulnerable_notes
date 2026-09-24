import { Link } from "react-router-dom";
import { AuthLayout } from "../../components/AuthLayout/index.tsx";
import { Input } from "../../components/Input/index.tsx";
import { Button } from "../../components/Button/index.tsx";
import { useLogin } from "./index.ts";

export function Login() {
  const { email, setEmail, password, setPassword, error, loading, handleSubmit } = useLogin();

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Pick up where you left off."
      footer={
        <>
          <Link to="/recover-password" className="border-b border-rule text-ink no-underline hover:border-accent hover:text-accent">
            Forgot your password?
          </Link>
          <span>
            New here?{" "}
            <Link to="/register" className="border-b border-rule text-ink no-underline hover:border-accent hover:text-accent">
              Create an account
            </Link>
          </span>
        </>
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
          autoComplete="current-password"
          required
        />

        {error && (
          <p role="alert" className="border-l-2 border-error bg-error-bg px-2.5 py-2 font-mono text-[13px] text-error">
            {error}
          </p>
        )}

        <Button type="submit" className="mt-2" loading={loading}>
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}
