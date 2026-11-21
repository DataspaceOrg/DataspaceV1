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

export type LoginChallenge = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  user: PublicUser;
  access_time: string;
};

export async function registerUser(body: UserCreate) {
  // Send the request to the  /signup API in the backend.
  const response = await fetch(`${getAddress()}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  const AuthData = await response.json();
  return AuthData;
}

export async function loginUser(body: LoginChallenge): Promise<LoginResponse> {
  const response = await fetch(`${getAddress()}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  const LoginData = await response.json();
  return LoginData;
}
