import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import App from "../src/App";
import { clearWorkspace } from "../src/shared/workspace";

vi.mock("axios", () => ({
  default: { post: vi.fn(), isAxiosError: () => false },
}));
const dataset = {
  dataset_id: "12345678-abcd",
  upload_type: "csv",
  raw_byte_size: 2048,
  dataset_path: "/not-for-display",
  tables: ["orders", "customers"],
  schema: {
    orders: { amount: "DOUBLE" },
    customers: { customer_id: "VARCHAR" },
  },
};
const noSession = { exists: false, session: null, queries: [] };
const fetchMock = vi.fn();
function response(data: unknown, status = 200) {
  return { ok: status < 400, status, json: async () => data };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
function Location() {
  const location = useLocation();
  return (
    <div aria-label="Location">
      {location.pathname}
      {location.search}
    </div>
  );
}
function mount(path = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <Location />
    </MemoryRouter>,
  );
}
function query(text: string, prompt = "") {
  return {
    message: "ok",
    session: {},
    query: {
      agent_step: "insight",
      response_output: text,
      prompt_input: prompt,
    },
  };
}
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("dataspace_user_id", "user-1");
  localStorage.setItem("dataspace_username", "Avery");
  clearWorkspace();
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  vi.mocked(axios.post).mockReset();
  fetchMock.mockImplementation(async (url: string) =>
    response(
      url.includes("/session?")
        ? noSession
        : url.endsWith("/db/datasets")
          ? [dataset]
          : dataset,
    ),
  );
});

describe("authentication and navigation", () => {
  it("redirects visitors without identity to the real login form", async () => {
    localStorage.clear();
    mount();
    expect(
      await screen.findByRole("heading", { name: "Log in" }),
    ).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(["login", "signup"])(
    "submits %s to the real API, stores identity, and opens the library",
    async (mode) => {
      localStorage.clear();
      fetchMock.mockImplementation(async (url: string) =>
        response(
          url.includes("/auth/")
            ? {
                user: {
                  user_id: "new-user",
                  username: "Avery",
                  email: "avery@example.com",
                },
              }
            : [],
        ),
      );
      mount(`/${mode}`);
      const user = userEvent.setup();
      if (mode === "signup")
        await user.type(screen.getByLabelText("Username"), "Avery");
      await user.type(screen.getByLabelText("Email"), "avery@example.com");
      await user.type(screen.getByLabelText("Password"), "example123");
      await user.click(
        screen.getByRole("button", {
          name: mode === "signup" ? "Create account" : "Log in",
        }),
      );
      expect(
        await screen.findByRole("heading", { name: "Datasets" }),
      ).toBeVisible();
      expect(localStorage.getItem("dataspace_user_id")).toBe("new-user");
      expect(fetchMock.mock.calls[0][0]).toContain(
        mode === "signup" ? "/auth/register" : "/auth/login",
      );
    },
  );
  it("reports authentication failure and retains inputs", async () => {
    fetchMock.mockResolvedValue(
      response({ detail: "Invalid credentials" }, 401),
    );
    mount("/login");
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "avery@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid credentials",
    );
    expect(screen.getByLabelText("Email")).toHaveValue("avery@example.com");
  });
  it("clears identity and returns to the landing page on logout", async () => {
    mount();
    await screen.findByText("Dataset 12345678");
    await userEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(localStorage.getItem("dataspace_user_id")).toBeNull();
    expect(screen.getByRole("heading", { name: /Get to know/ })).toBeVisible();
  });
});

describe("dataset library", () => {
  it("shows loading, retries an API error, and displays actual metadata", async () => {
    const pending = deferred<ReturnType<typeof response>>();
    fetchMock.mockReturnValueOnce(pending.promise);
    mount();
    expect(screen.getByRole("status")).toHaveTextContent("Loading datasets");
    await act(async () =>
      pending.resolve(response({ detail: "Unavailable" }, 503)),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Unavailable");
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Dataset 12345678")).toBeVisible();
    expect(screen.getByText("2.0 KB")).toBeVisible();
    expect(fetchMock.mock.calls[0][1].headers["x-user-id"]).toBe("user-1");
  });
  it("offers upload from an empty library", async () => {
    fetchMock.mockResolvedValue(response([]));
    mount();
    expect(await screen.findByText("No datasets yet")).toBeVisible();
    expect(
      screen.getAllByRole("link", { name: "Upload dataset" }),
    ).toHaveLength(2);
  });
  it("filters by table name and format, clears no-results, and retains URL state on return", async () => {
    mount("/dashboard?q=orders&type=CSV");
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole("link", { name: /Dataset 12345678/ }),
    );
    expect(
      await screen.findByRole("heading", { name: "Dataset 12345678" }),
    ).toBeVisible();
    await user.click(
      within(screen.getByRole("main")).getByRole("link", { name: "Datasets" }),
    );
    expect(screen.getByRole("searchbox")).toHaveValue("orders");
    expect(screen.getByRole("combobox")).toHaveValue("CSV");
    await user.selectOptions(screen.getByRole("combobox"), "SQLite");
    expect(screen.getByText("No matching datasets")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });
});

describe("uploads", () => {
  it("validates unsupported and empty dataset files without a request", async () => {
    mount("/upload");
    const user = userEvent.setup({ applyAccept: false });
    await user.upload(
      screen.getByLabelText("Dataset file"),
      new File(["x"], "wrong.json"),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose a CSV or SQLite file",
    );
    expect(
      screen.getByRole("button", { name: "Upload dataset" }),
    ).toBeDisabled();
    await user.upload(
      screen.getByLabelText("Dataset file"),
      new File([], "empty.csv"),
    );
    expect(screen.getByRole("alert")).toHaveTextContent("empty");
    expect(axios.post).not.toHaveBeenCalled();
  });
  it("keeps forms independent and shows the actual Azure response without opening a dataset", async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        dataset_id: "blob-id",
        container: "files",
        blob_name: "blob-id/cloud.txt",
      },
    });
    mount("/upload");
    const user = userEvent.setup();
    await user.upload(
      screen.getByLabelText("Dataset file"),
      new File(["a,b\n1,2"], "analysis.csv"),
    );
    await user.upload(
      screen.getByLabelText("File for cloud storage"),
      new File(["cloud"], "cloud.txt"),
    );
    await user.click(
      screen.getByRole("button", { name: "Upload to cloud storage" }),
    );
    expect(await screen.findByText("blob-id/cloud.txt")).toBeVisible();
    expect(
      screen.getByText("This file does not appear in the dataset library."),
    ).toBeVisible();
    expect(screen.getByText(/analysis.csv ·/)).toBeVisible();
    const call = vi.mocked(axios.post).mock.calls[0];
    expect(call[0]).toContain("/dataset/upload");
    expect((call[1] as FormData).get("file")).toBeInstanceOf(File);
  });
  it("distinguishes transfer from processing, prevents duplicates, and refetches the library after success", async () => {
    const pending = deferred<{ data: { message: string } }>();
    vi.mocked(axios.post).mockReturnValue(pending.promise);
    mount("/upload");
    const user = userEvent.setup();
    await user.upload(
      screen.getByLabelText("Dataset file"),
      new File(["a\n1"], "data.csv"),
    );
    await user.dblClick(screen.getByRole("button", { name: "Upload dataset" }));
    expect(axios.post).toHaveBeenCalledTimes(1);
    const config = vi.mocked(axios.post).mock.calls[0][2]!;
    await act(async () =>
      config.onUploadProgress?.({
        loaded: 1,
        total: 2,
        bytes: 1,
        lengthComputable: true,
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("50%");
    await act(async () =>
      config.onUploadProgress?.({
        loaded: 2,
        total: 2,
        bytes: 1,
        lengthComputable: true,
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Processing");
    await act(async () => pending.resolve({ data: { message: "ok" } }));
    expect(
      await screen.findByText("Dataset uploaded successfully."),
    ).toBeVisible();
    expect(await screen.findByText("Dataset 12345678")).toBeVisible();
  });
  it("retains a file after failure and retries it", async () => {
    vi.mocked(axios.post)
      .mockRejectedValueOnce(new Error("Storage unavailable"))
      .mockResolvedValueOnce({ data: { message: "ok" } });
    mount("/upload");
    const user = userEvent.setup();
    await user.upload(
      screen.getByLabelText("Dataset file"),
      new File(["a\n1"], "data.csv"),
    );
    await user.click(screen.getByRole("button", { name: "Upload dataset" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Storage unavailable",
    );
    expect(screen.getByText(/data.csv ·/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Retry upload" }));
    expect(
      await screen.findByText("Dataset uploaded successfully."),
    ).toBeVisible();
  });
});

describe("schema and analysis", () => {
  it("restores saved result and context, while drafts remain specific to each table", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      response(
        url.includes("/session?")
          ? {
              exists: true,
              session: {},
              queries: [query("Saved insight", "Saved context").query],
            }
          : dataset,
      ),
    );
    mount(`/dataset/${dataset.dataset_id}?table=orders`);
    const user = userEvent.setup();
    expect(await screen.findByText("Saved insight")).toBeVisible();
    expect(screen.getByLabelText("Additional context (optional)")).toHaveValue(
      "Saved context",
    );
    await user.clear(screen.getByLabelText("Additional context (optional)"));
    await user.type(
      screen.getByLabelText("Additional context (optional)"),
      "Orders draft",
    );
    await user.click(screen.getByRole("button", { name: "customers" }));
    expect(await screen.findByText("customer_id")).toBeVisible();
    await waitFor(() =>
      expect(
        screen.getByLabelText("Additional context (optional)"),
      ).toHaveValue("Saved context"),
    );
    await user.click(screen.getByRole("button", { name: "orders" }));
    expect(screen.getByLabelText("Additional context (optional)")).toHaveValue(
      "Orders draft",
    );
  });
  it("does not show a delayed result for another table, and prevents duplicate insight requests", async () => {
    const pending = deferred<ReturnType<typeof response>>();
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith("/insight")
        ? pending.promise
        : response(url.includes("/session?") ? noSession : dataset),
    );
    mount(`/dataset/${dataset.dataset_id}`);
    const user = userEvent.setup();
    const run = await screen.findByRole("button", {
      name: "Run initial insight",
    });
    await waitFor(() => expect(run).toBeEnabled());
    await user.dblClick(run);
    expect(
      fetchMock.mock.calls.filter((call) => call[0].endsWith("/insight")),
    ).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "customers" }));
    await act(async () => pending.resolve(response(query("Orders result"))));
    expect(screen.queryByText("Orders result")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "orders" }));
    expect(screen.getByText("Orders result")).toBeVisible();
  });
  it("ignores a late restoration after a table switch and preserves edits made during restoration", async () => {
    const pending = deferred<ReturnType<typeof response>>();
    fetchMock.mockImplementation(async (url: string) =>
      url.includes("table_name=orders")
        ? pending.promise
        : response(url.includes("/session?") ? noSession : dataset),
    );
    mount(`/dataset/${dataset.dataset_id}`);
    const user = userEvent.setup();
    await user.type(
      await screen.findByLabelText("Additional context (optional)"),
      "My draft",
    );
    await user.click(screen.getByRole("button", { name: "customers" }));
    await act(async () =>
      pending.resolve(
        response({
          exists: true,
          session: {},
          queries: [query("Old orders insight", "Old context").query],
        }),
      ),
    );
    expect(screen.queryByText("Old orders insight")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "orders" }));
    expect(screen.getByLabelText("Additional context (optional)")).toHaveValue(
      "My draft",
    );
  });
  it("keeps restoration and execution errors local with working retries", async () => {
    let restoreCount = 0,
      runCount = 0;
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/session?"))
        return response(
          ++restoreCount === 1 ? { detail: "Restore failed" } : noSession,
          restoreCount === 1 ? 500 : 200,
        );
      if (url.endsWith("/insight"))
        return response(
          ++runCount === 1
            ? { detail: "Insight failed" }
            : query("Retried result"),
          runCount === 1 ? 500 : 200,
        );
      return response(dataset);
    });
    mount(`/dataset/${dataset.dataset_id}`);
    const user = userEvent.setup();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Restore failed",
    );
    expect(screen.getByText("amount")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Retry restoration" }));
    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
    );
    await user.click(
      screen.getByRole("button", { name: "Run initial insight" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Insight failed",
    );
    await user.click(
      screen.getByRole("button", { name: "Retry initial insight" }),
    );
    expect(await screen.findByText("Retried result")).toBeVisible();
  });
  it("allows SQLite schema inspection but disables unsupported analysis", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      response(
        url.includes("/session?")
          ? noSession
          : { ...dataset, upload_type: "sqlite" },
      ),
    );
    mount(`/dataset/${dataset.dataset_id}`);
    expect(await screen.findByText("amount")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Run initial insight" }),
    ).toBeDisabled();
    expect(screen.getByText(/unavailable for .sqlite/)).toBeVisible();
  });
  it("renders untrusted response content as text", async () => {
    const text = "<img src=x onerror=alert(1)>";
    fetchMock.mockImplementation(async (url: string) =>
      response(
        url.includes("/session?")
          ? { exists: true, session: {}, queries: [query(text).query] }
          : dataset,
      ),
    );
    mount(`/dataset/${dataset.dataset_id}`);
    expect(await screen.findByText(text)).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
