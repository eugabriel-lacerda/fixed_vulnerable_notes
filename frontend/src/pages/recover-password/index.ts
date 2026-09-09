import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset, confirmPasswordReset } from "../../api/passwordReset";

export function useRecoverPassword() {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await requestPasswordReset(email);
      setMessage("Check the server console for your recovery code.");
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request reset");
    }
  }

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await confirmPasswordReset(email, code, newPassword);
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    }
  }

  return {
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
  };
}
