import { useSyncExternalStore } from "react";
import { queryInsightAgent, restoreTableSession } from "./api";
import { errorMessage } from "./http";
type TableState = {
  context: string;
  draft: boolean;
  result: string | null;
  restored: boolean;
  restoring: boolean;
  pending: boolean;
  restoreError: string | null;
  runError: string | null;
  revision: number;
};
const empty: TableState = {
  context: "",
  draft: false,
  result: null,
  restored: false,
  restoring: false,
  pending: false,
  restoreError: null,
  runError: null,
  revision: 0,
};
let tables: Record<string, TableState> = {};
let epoch = 0;
const listeners = new Set<() => void>();
export const workspaceNavigation = { library: "/dashboard" };
const keyFor = (id: string, table: string) => JSON.stringify([id, table]);
function update(key: string, patch: Partial<TableState>) {
  tables = { ...tables, [key]: { ...(tables[key] || empty), ...patch } };
  listeners.forEach((fn) => fn());
}
export function clearWorkspace() {
  epoch++;
  tables = {};
  workspaceNavigation.library = "/dashboard";
  listeners.forEach((fn) => fn());
}
export function useTableState(id: string, table: string) {
  const key = keyFor(id, table);
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => tables[key] || empty,
  );
}
export function setContext(id: string, table: string, context: string) {
  update(keyFor(id, table), { context, draft: true });
}
export async function restoreAnalysis(
  id: string,
  table: string,
  retry = false,
) {
  const key = keyFor(id, table),
    state = tables[key] || empty;
  if (state.restoring || state.pending || (state.restored && !retry)) return;
  const started = epoch,
    revision = state.revision;
  update(key, { restoring: true, restoreError: null });
  try {
    const response = await restoreTableSession(id, table);
    if (epoch !== started || tables[key].revision !== revision) return;
    const latest = response.exists
      ? [...response.queries].reverse().find((q) => q.agent_step === "insight")
      : undefined;
    update(key, {
      result: latest?.response_output ?? null,
      ...(!tables[key].draft ? { context: latest?.prompt_input ?? "" } : {}),
      restored: true,
    });
  } catch (error) {
    if (epoch === started && tables[key].revision === revision)
      update(key, { restoreError: errorMessage(error) });
  } finally {
    if (epoch === started && tables[key].revision === revision)
      update(key, { restoring: false });
  }
}
export async function runAnalysis(id: string, table: string) {
  const key = keyFor(id, table),
    state = tables[key] || empty;
  if (state.pending || state.restoring) return;
  const started = epoch;
  update(key, { pending: true, runError: null, revision: state.revision + 1 });
  try {
    const response = await queryInsightAgent(id, {
      table_name: table,
      dataset_context: state.context,
    });
    if (epoch === started)
      update(key, {
        result: response.query.response_output,
        restoreError: null,
        restored: true,
      });
  } catch (error) {
    if (epoch === started) update(key, { runError: errorMessage(error) });
  } finally {
    if (epoch === started) update(key, { pending: false });
  }
}
