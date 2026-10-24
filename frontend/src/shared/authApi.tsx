import { request } from "./http";
export type User = {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
};
export type AuthResponse = { message: string; user: User };
export const registerUser = (body: {
  username: string;
  email: string;
  password: string;
}) =>
  request<AuthResponse>(
    "/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    false,
  );
export const loginUser = (body: { email: string; password: string }) =>
  request<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    false,
  );
