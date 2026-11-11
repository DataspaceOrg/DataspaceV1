const LOCAL_BACKEND_URL = "http://localhost:8000";
const FALLBACK_ERROR_TEXT = "The request failed. Please try again.";

export function getAddress(): string {
  return LOCAL_BACKEND_URL;
}

type ErrorResponse = {
  detail?: string | Array<{ msg: string }>;
};

export async function getApiError(response: Response): Promise<string> {
  try {
    const body: ErrorResponse = await response.json();
    if (typeof body.detail === "string") {
      return body.detail;
    }
    if (Array.isArray(body.detail)) {
      return (
        body.detail.map((error) => error.msg).join("; ") || FALLBACK_ERROR_TEXT
      );
    }
    return FALLBACK_ERROR_TEXT;
  } catch {
    // Empt or non-JSON responses.
    console.log("[ERROR] Undefined Response returned.");
    return FALLBACK_ERROR_TEXT;
  }
}
