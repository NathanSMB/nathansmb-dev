import { For, type JSX } from "solid-js";
import { createColumnHelper } from "@tanstack/solid-table";
import Button from "~/components/ui/Button";
import Pill from "~/components/ui/Pill";
import Table from "~/components/ui/Table";

export interface BlogPostRow {
    id: string;
    title: string;
    slug: string;
    status: string;
    tags: string[] | null;
    authorName: string;
    publishedAt: string | null;
    createdAt: string;
}

type SortableField =
    | "title"
    | "status"
    | "authorName"
    | "publishedAt"
    | "createdAt";

interface BlogTableProps {
    posts: BlogPostRow[];
    sortBy: string;
    sortDirection: "asc" | "desc";
    onSort: (field: SortableField) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string, title: string) => void;
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return "\u2014";
    return new Date(dateStr).toLocaleDateString();
}

export default function BlogTable(props: BlogTableProps) {
    const columnHelper = createColumnHelper<BlogPostRow>();

    const columns = [
        columnHelper.accessor("title", {
            header: "Title",
            size: 280,
            minSize: 180,
        }),
        columnHelper.accessor("status", {
            header: "Status",
            size: 100,
            minSize: 80,
            cell: (info): JSX.Element => (
                <Pill
                    color={
                        info.getValue() === "published" ? "success" : "neutral"
                    }
                >
                    {info.getValue()}
                </Pill>
            ),
        }),
        columnHelper.display({
            id: "tags",
            header: "Tags",
            enableSorting: false,
            size: 200,
            minSize: 140,
            cell: (info): JSX.Element => (
                <div
                    style={{
                        display: "flex",
                        "flex-wrap": "wrap",
                        gap: "0.3rem",
                    }}
                >
                    <For each={info.row.original.tags ?? []}>
                        {(tag) => <Pill color="primary">{tag}</Pill>}
                    </For>
                </div>
            ),
        }),
        columnHelper.accessor("authorName", {
            header: "Author",
            size: 140,
            minSize: 100,
        }),
        columnHelper.accessor("publishedAt", {
            header: "Published",
            size: 120,
            minSize: 100,
            cell: (info) => formatDate(info.getValue()),
        }),
        columnHelper.display({
            id: "actions",
            header: "Actions",
            enableSorting: false,
            size: 160,
            minSize: 140,
            cell: (info): JSX.Element => (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button onClick={() => props.onEdit(info.row.original.id)}>
                        Edit
                    </Button>
                    <Button
                        color="danger"
                        onClick={() =>
                            props.onDelete(
                                info.row.original.id,
                                info.row.original.title,
                            )
                        }
                    >
                        Delete
                    </Button>
                </div>
            ),
        }),
    ];

    return (
        <Table
            data={props.posts}
            columns={columns}
            sortBy={props.sortBy}
            sortDirection={props.sortDirection}
            onSort={(field) => props.onSort(field as SortableField)}
            emptyMessage="No posts found"
        />
    );
}
