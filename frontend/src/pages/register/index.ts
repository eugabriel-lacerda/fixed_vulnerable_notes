import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api/auth";

export function useRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const result = await register(email, password);
      localStorage.setItem("token", result.token);
      navigate("/notes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    handleSubmit,
  };
}
