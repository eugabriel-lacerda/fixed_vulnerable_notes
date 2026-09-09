import { apiFetch } from "./client";

export async function requestPasswordReset(email: string) {
  return apiFetch("/auth/recover-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset(email: string, code: string, newPassword: string) {
  return apiFetch("/auth/recover-password/confirm", {
    method: "POST",
    body: JSON.stringify({ email, code, newPassword }),
  });
}
