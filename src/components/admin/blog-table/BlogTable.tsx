import { Show, For } from "solid-js";
import Button from "~/components/ui/Button";
import Pill from "~/components/ui/Pill";
import css from "~/components/admin/table/admin-table.css?inline";

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

export default function BlogTable(props: BlogTableProps) {
    function sortIndicator(field: SortableField) {
        if (props.sortBy !== field) return "";
        return props.sortDirection === "asc" ? " ▲" : " ▼";
    }

    function formatDate(dateStr: string | null) {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString();
    }

    return (
        <>
            <style>{css}</style>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("title")}
                        >
                            Title{sortIndicator("title")}
                        </th>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("status")}
                        >
                            Status{sortIndicator("status")}
                        </th>
                        <th>Tags</th>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("authorName")}
                        >
                            Author{sortIndicator("authorName")}
                        </th>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("publishedAt")}
                        >
                            Published{sortIndicator("publishedAt")}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <Show
                        when={props.posts.length > 0}
                        fallback={
                            <tr>
                                <td colspan="6" class="admin-empty">
                                    No posts found
                                </td>
                            </tr>
                        }
                    >
                        <For each={props.posts}>
                            {(row) => (
                                <tr>
                                    <td>{row.title}</td>
                                    <td>
                                        <Pill
                                            color={
                                                row.status === "published"
                                                    ? "success"
                                                    : "neutral"
                                            }
                                        >
                                            {row.status}
                                        </Pill>
                                    </td>
                                    <td>
                                        <For each={row.tags ?? []}>
                                            {(tag) => (
                                                <Pill color="primary">
                                                    {tag}
                                                </Pill>
                                            )}
                                        </For>
                                    </td>
                                    <td>{row.authorName}</td>
                                    <td>{formatDate(row.publishedAt)}</td>
                                    <td style="display: flex; gap: 0.5rem;">
                                        <Button
                                            onClick={() => props.onEdit(row.id)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            color="danger"
                                            onClick={() =>
                                                props.onDelete(
                                                    row.id,
                                                    row.title,
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
