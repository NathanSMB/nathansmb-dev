import { Show, For } from "solid-js";
import Pill from "~/components/ui/Pill";
import css from "~/components/admin/table/admin-table.css?inline";

export interface SessionRow {
    id: string;
    game: string;
    startedAt: string;
    endedAt: string | null;
    submitted: boolean;
    userName: string;
    userId: string;
}

type SortableField =
    | "userName"
    | "game"
    | "startedAt"
    | "endedAt"
    | "submitted";

interface SessionTableProps {
    sessions: SessionRow[];
    sortBy: string;
    sortDirection: "asc" | "desc";
    onSort: (field: SortableField) => void;
}

export default function SessionTable(props: SessionTableProps) {
    function sortIndicator(field: SortableField) {
        if (props.sortBy !== field) return "";
        return props.sortDirection === "asc" ? " ▲" : " ▼";
    }

    function formatDate(dateStr: string | null) {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleString();
    }

    return (
        <>
            <style>{css}</style>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("userName")}
                        >
                            Player{sortIndicator("userName")}
                        </th>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("game")}
                        >
                            Game{sortIndicator("game")}
                        </th>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("startedAt")}
                        >
                            Started{sortIndicator("startedAt")}
                        </th>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("endedAt")}
                        >
                            Ended{sortIndicator("endedAt")}
                        </th>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("submitted")}
                        >
                            Submitted{sortIndicator("submitted")}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <Show
                        when={props.sessions.length > 0}
                        fallback={
                            <tr>
                                <td colspan="5" class="admin-empty">
                                    No sessions found
                                </td>
                            </tr>
                        }
                    >
                        <For each={props.sessions}>
                            {(row) => (
                                <tr>
                                    <td>{row.userName}</td>
                                    <td>{row.game}</td>
                                    <td>{formatDate(row.startedAt)}</td>
                                    <td>{formatDate(row.endedAt)}</td>
                                    <td>
                                        <Pill
                                            color={
                                                row.submitted
                                                    ? "success"
                                                    : "neutral"
                                            }
                                        >
                                            {row.submitted ? "Yes" : "No"}
                                        </Pill>
                                    </td>
                                </tr>
                            )}
                        </For>
                    </Show>
                </tbody>
            </table>
        </>
    );
}
