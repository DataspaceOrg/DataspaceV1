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
  access_token: string;
  token_type: "bearer";
  expires_in: number;
};

export type RegistrationResponse = {
  message: string;
  user: PublicUser;
  access_time: string;
};

export async function registerUser(
  body: UserCreate,
): Promise<RegistrationResponse> {
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

let accessToken: string | null = null;

export async function loginUser(
  body: { email: string; password: string },
): Promise<LoginResponse> {
  const response = await fetch(`${getAddress()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  const data: LoginResponse = await response.json();
  if (!data.access_token) {
    throw new Error("Login response did not include an access token.");
  }
  accessToken = data.access_token;
  return data;
}

export function logoutUser() {
  accessToken = null;
}

export function getAuthHeaders(): Record<string, string> {
  if (!accessToken) {
    throw new Error("Please log in first.");
  }

  return { Authorization: `Bearer ${accessToken}` };
}

export async function authenticatedFetch(
  url: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", getAuthHeaders().Authorization);

  const response = await fetch(url, { ...init, headers });

  if (response.status === 401) {
    accessToken = null;
  }

  return response;
}