import { Show, For } from "solid-js";
import Button from "~/components/ui/Button";
import css from "~/components/admin/table/admin-table.css?inline";

export interface ScoreRow {
    id: string;
    score: number;
    wave: number;
    game: string;
    createdAt: string;
    userName: string;
    userId: string;
}

type SortableField = "userName" | "score" | "wave" | "createdAt";

interface ScoreTableProps {
    scores: ScoreRow[];
    sortBy: string;
    sortDirection: "asc" | "desc";
    onSort: (field: SortableField) => void;
    onDelete: (scoreId: string, playerName: string, score: number) => void;
}

export default function ScoreTable(props: ScoreTableProps) {
    function sortIndicator(field: SortableField) {
        if (props.sortBy !== field) return "";
        return props.sortDirection === "asc" ? " ▲" : " ▼";
    }

    function formatDate(dateStr: string) {
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
                            onClick={() => props.onSort("score")}
                        >
                            Score{sortIndicator("score")}
                        </th>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("wave")}
                        >
                            Wave{sortIndicator("wave")}
                        </th>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("createdAt")}
                        >
                            Date{sortIndicator("createdAt")}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <Show
                        when={props.scores.length > 0}
                        fallback={
                            <tr>
                                <td colspan="5" class="admin-empty">
                                    No scores found
                                </td>
                            </tr>
                        }
                    >
                        <For each={props.scores}>
                            {(row) => (
                                <tr>
                                    <td>{row.userName}</td>
                                    <td>{row.score.toLocaleString()}</td>
                                    <td>{row.wave}</td>
                                    <td>{formatDate(row.createdAt)}</td>
                                    <td>
                                        <Button
                                            color="danger"
                                            onClick={() =>
                                                props.onDelete(
                                                    row.id,
                                                    row.userName,
                                                    row.score,
                                                )
                                            }
                                        >
                                            Delete
                                        </Button>
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
