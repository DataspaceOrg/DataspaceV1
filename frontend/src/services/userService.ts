import { getAddress, getApiError } from "./webService";

export type UserCreate = {
  username: string;
  email: string;
  password: string;
};

export type PublicUser = {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  message: string;
  user: PublicUser;
  access_time: string;
};

type LoginCredentials = Pick<UserCreate, "email" | "password">;

async function submitAuth(
  action: "register" | "login",
  body: UserCreate | LoginCredentials,
): Promise<LoginResponse> {
  const response = await fetch(`${getAddress()}/auth/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  return response.json();
}

export function registerUser(body: UserCreate): Promise<LoginResponse> {
  return submitAuth("register", body);
}

export function loginUser(body: LoginCredentials): Promise<LoginResponse> {
  return submitAuth("login", body);
}
