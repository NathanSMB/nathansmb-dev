import { Show } from "solid-js";
import type { Role } from "../types";
import { isValidRole } from "../types";
import ProgressBar from "~/components/ui/ProgressBar";
import css from "./BatchBar.css?inline";

interface BatchBarProps {
  selectedCount: number;
  batchProgress: { current: number; total: number; label: string } | null;
  batchRole: Role;
  batchBanReason: string;
  onSetBatchRole: (value: Role) => void;
  onBatchSetRole: () => void;
  onSetBatchBanReason: (value: string) => void;
  onBatchBan: () => void;
  onBatchUnban: () => void;
  onBatchDelete: () => void;
}

export default function BatchBar(props: BatchBarProps) {
  return (
    <>
      <style>{css}</style>
      <div class="admin-batch-bar">
        <Show
          when={!props.batchProgress}
          fallback={
            <ProgressBar
              current={props.batchProgress!.current}
              total={props.batchProgress!.total}
              label={props.batchProgress!.label}
            />
          }
        >
          <span>{props.selectedCount} user(s) selected</span>
          <select
            value={props.batchRole}
            onChange={(e) => {
              const value = e.currentTarget.value;
              if (isValidRole(value)) props.onSetBatchRole(value);
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={props.onBatchSetRole}>Set role</button>
          <input
            class="batch-ban-reason"
            type="text"
            placeholder="Ban reason (optional)"
            value={props.batchBanReason}
            onInput={(e) => props.onSetBatchBanReason(e.currentTarget.value)}
          />
          <button class="batch-ban" onClick={props.onBatchBan}>
            Ban selected
          </button>
          <button class="batch-unban" onClick={props.onBatchUnban}>
            Unban selected
          </button>
          <button class="batch-delete" onClick={props.onBatchDelete}>
            Delete selected
          </button>
        </Show>
      </div>
    </>
  );
}
