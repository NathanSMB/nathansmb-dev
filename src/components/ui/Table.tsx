import { Show, For, type JSX } from "solid-js";
import {
    createSolidTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
    type Row,
    type SortingState,
} from "@tanstack/solid-table";
import css from "./Table.css?inline";

interface TableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData, any>[];
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    onSort?: (field: string) => void;
    emptyMessage?: string;
    class?: string;
    renderRow?: (row: Row<TData>) => JSX.Element;
}

export default function Table<TData>(props: TableProps<TData>) {
    const sorting = (): SortingState =>
        props.sortBy
            ? [{ id: props.sortBy, desc: props.sortDirection === "desc" }]
            : [];

    const table = createSolidTable({
        get data() {
            return props.data;
        },
        get columns() {
            return props.columns;
        },
        state: {
            get sorting() {
                return sorting();
            },
        },
        onSortingChange: (updater) => {
            if (!props.onSort) return;
            const next =
                typeof updater === "function" ? updater(sorting()) : updater;
            if (next.length > 0) {
                props.onSort(next[0].id);
            }
        },
        manualSorting: true,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <style>{css}</style>
            <table
                class={
                    props.class ? `admin-table ${props.class}` : "admin-table"
                }
            >
                <thead>
                    <For each={table.getHeaderGroups()}>
                        {(headerGroup) => (
                            <tr>
                                <For each={headerGroup.headers}>
                                    {(header) => (
                                        <th
                                            class={
                                                header.column.getCanSort()
                                                    ? "sortable"
                                                    : undefined
                                            }
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                            <Show
                                                when={header.column.getIsSorted()}
                                            >
                                                {header.column.getIsSorted() ===
                                                "asc"
                                                    ? " \u25B2"
                                                    : " \u25BC"}
                                            </Show>
                                        </th>
                                    )}
                                </For>
                            </tr>
                        )}
                    </For>
                </thead>
                <tbody>
                    <Show
                        when={table.getRowModel().rows.length > 0}
                        fallback={
                            <tr>
                                <td
                                    colspan={table.getAllColumns().length}
                                    class="admin-empty"
                                >
                                    {props.emptyMessage ?? "No data found"}
                                </td>
                            </tr>
                        }
                    >
                        <For each={table.getRowModel().rows}>
                            {(row) => (
                                <Show
                                    when={!props.renderRow}
                                    fallback={props.renderRow?.(row)}
                                >
                                    <tr>
                                        <For each={row.getVisibleCells()}>
                                            {(cell) => (
                                                <td>
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
                                                        cell.getContext(),
                                                    )}
                                                </td>
                                            )}
                                        </For>
                                    </tr>
                                </Show>
                            )}
                        </For>
                    </Show>
                </tbody>
            </table>
        </>
    );
}
