import { type JSX } from "solid-js";
import { createColumnHelper } from "@tanstack/solid-table";
import Button from "~/components/ui/Button";
import Table from "~/components/ui/Table";

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

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
}

export default function ScoreTable(props: ScoreTableProps) {
    const columnHelper = createColumnHelper<ScoreRow>();

    const columns = [
        columnHelper.accessor("userName", {
            header: "Player",
            size: 200,
            minSize: 140,
        }),
        columnHelper.accessor("score", {
            header: "Score",
            size: 120,
            minSize: 80,
            cell: (info) => info.getValue().toLocaleString(),
        }),
        columnHelper.accessor("wave", {
            header: "Wave",
            size: 80,
            minSize: 60,
        }),
        columnHelper.accessor("createdAt", {
            header: "Date",
            size: 200,
            minSize: 140,
            cell: (info) => formatDate(info.getValue()),
        }),
        columnHelper.display({
            id: "actions",
            header: "Actions",
            enableSorting: false,
            size: 100,
            minSize: 80,
            cell: (info): JSX.Element => (
                <Button
                    color="danger"
                    onClick={() =>
                        props.onDelete(
                            info.row.original.id,
                            info.row.original.userName,
                            info.row.original.score,
                        )
                    }
                >
                    Delete
                </Button>
            ),
        }),
    ];

    return (
        <Table
            data={props.scores}
            columns={columns}
            sortBy={props.sortBy}
            sortDirection={props.sortDirection}
            onSort={(field) => props.onSort(field as SortableField)}
            emptyMessage="No scores found"
        />
    );
}
