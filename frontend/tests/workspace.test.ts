import { beforeEach, expect, it, vi } from "vitest";
import {
  clearWorkspace,
  restoreAnalysis,
  runAnalysis,
  setContext,
  workspaceNavigation,
} from "../src/shared/workspace";
import { queryInsightAgent, restoreTableSession } from "../src/shared/api";
vi.mock("../src/shared/api", () => ({
  queryInsightAgent: vi.fn(),
  restoreTableSession: vi.fn(),
}));
beforeEach(() => {
  clearWorkspace();
  vi.mocked(queryInsightAgent).mockReset();
  vi.mocked(restoreTableSession).mockReset();
});
it("does not restore a logged-out user’s pending result into a new workspace", async () => {
  let complete!: (value: Awaited<ReturnType<typeof queryInsightAgent>>) => void;
  vi.mocked(queryInsightAgent).mockReturnValue(
    new Promise((resolve) => {
      complete = resolve;
    }),
  );
  setContext("dataset", "orders", "Private draft");
  const pending = runAnalysis("dataset", "orders");
  workspaceNavigation.library = "/dashboard?q=private";
  clearWorkspace();
  complete({
    message: "ok",
    session: {} as Awaited<ReturnType<typeof queryInsightAgent>>["session"],
    query: { response_output: "Private result" } as Awaited<
      ReturnType<typeof queryInsightAgent>
    >["query"],
  });
  await pending;
  expect(workspaceNavigation.library).toBe("/dashboard");
  vi.mocked(restoreTableSession).mockResolvedValue({
    exists: false,
    session: null,
    queries: [],
  });
  await restoreAnalysis("dataset", "orders");
  // A completed old request must not mark this new workspace as restored.
  expect(restoreTableSession).toHaveBeenCalledTimes(1);
  vi.mocked(queryInsightAgent).mockResolvedValue({
    message: "ok",
    session: {} as Awaited<ReturnType<typeof queryInsightAgent>>["session"],
    query: { response_output: "New result" } as Awaited<
      ReturnType<typeof queryInsightAgent>
    >["query"],
  });
  await runAnalysis("dataset", "orders");
  expect(queryInsightAgent).toHaveBeenLastCalledWith("dataset", {
    table_name: "orders",
    dataset_context: "",
  });
});
