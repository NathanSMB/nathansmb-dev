import { type JSX } from "solid-js";
import { createColumnHelper } from "@tanstack/solid-table";
import Pill from "~/components/ui/Pill";
import Table from "~/components/ui/Table";

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

function formatDate(dateStr: string | null) {
    if (!dateStr) return "\u2014";
    return new Date(dateStr).toLocaleString();
}

const columnHelper = createColumnHelper<SessionRow>();

const columns = [
    columnHelper.accessor("userName", {
        header: "Player",
        size: 180,
        minSize: 120,
    }),
    columnHelper.accessor("game", {
        header: "Game",
        size: 140,
        minSize: 100,
    }),
    columnHelper.accessor("startedAt", {
        header: "Started",
        size: 180,
        minSize: 140,
        cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("endedAt", {
        header: "Ended",
        size: 180,
        minSize: 140,
        cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("submitted", {
        header: "Submitted",
        size: 100,
        minSize: 80,
        cell: (info): JSX.Element => (
            <Pill color={info.getValue() ? "success" : "neutral"}>
                {info.getValue() ? "Yes" : "No"}
            </Pill>
        ),
    }),
];

export default function SessionTable(props: SessionTableProps) {
    return (
        <Table
            data={props.sessions}
            columns={columns}
            sortBy={props.sortBy}
            sortDirection={props.sortDirection}
            onSort={(field) => props.onSort(field as SortableField)}
            emptyMessage="No sessions found"
        />
    );
}
