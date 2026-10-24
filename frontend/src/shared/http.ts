import axios from "axios";
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export function identityHeaders() {
  const id = localStorage.getItem("dataspace_user_id");
  if (!id) throw new Error("Log in to continue.");
  return { "x-user-id": id };
}
export function errorMessage(value: unknown): string {
  if (axios.isAxiosError(value))
    return detailMessage(value.response?.data) || value.message;
  return value instanceof Error
    ? value.message
    : "Something went wrong. Please try again.";
}
function detailMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object" || !("detail" in data)) return;
  const detail = data.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((item) => {
        const field = Array.isArray(item.loc)
          ? item.loc.filter((part: unknown) => part !== "body").join(".")
          : "";
        return `${field ? field + ": " : ""}${item.msg || "Invalid value"}`;
      })
      .join(" ");
}
export async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(authenticated ? identityHeaders() : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      detailMessage(data) ||
        `Request failed (${response.status}). Please try again.`,
    );
  }
  return response.json();
}
