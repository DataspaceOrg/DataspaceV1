import { getAddress, getApiError } from "./webService";

export type UserCreate = {
  username: string;
  email: string;
  password: string;
};

export type PublicUser = {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type LoginChallenge = {
  email: string;
  password: string;
};

export type AuthResponse = {
  message: string;
  user: PublicUser;
};

export async function registerUser(body: UserCreate): Promise<AuthResponse> {
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

  return response.json();
}

export async function loginUser(body: LoginChallenge): Promise<AuthResponse> {
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

  return response.json();
}
