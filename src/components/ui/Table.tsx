import { Show, For, onMount, onCleanup, type JSX } from "solid-js";
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
    let scrollRef: HTMLDivElement | undefined;

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

    const minWidth = () =>
        table
            .getAllColumns()
            .reduce(
                (sum, col) => sum + (col.columnDef.minSize ?? col.getSize()),
                0,
            );

    function updateScrollClasses() {
        if (!scrollRef) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef;
        const isScrollable = scrollWidth > clientWidth;
        scrollRef.classList.toggle("is-scrollable", isScrollable);
        scrollRef.classList.toggle(
            "is-scrolled-end",
            isScrollable && scrollLeft + clientWidth >= scrollWidth - 1,
        );
    }

    onMount(() => {
        if (!scrollRef) return;
        updateScrollClasses();
        scrollRef.addEventListener("scroll", updateScrollClasses, {
            passive: true,
        });
        const ro = new ResizeObserver(updateScrollClasses);
        ro.observe(scrollRef);
        onCleanup(() => {
            scrollRef?.removeEventListener("scroll", updateScrollClasses);
            ro.disconnect();
        });
    });

    return (
        <>
            <style>{css}</style>
            <div class="table-scroll" ref={scrollRef}>
                <table
                    class={
                        props.class
                            ? `admin-table ${props.class}`
                            : "admin-table"
                    }
                    style={{ "min-width": `${minWidth()}px` }}
                >
                    <colgroup>
                        <For each={table.getAllColumns()}>
                            {(col) => (
                                <col
                                    style={{
                                        width: `${col.getSize()}px`,
                                    }}
                                />
                            )}
                        </For>
                    </colgroup>
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
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext(),
                                                      )}
                                                <Show
                                                    when={header.column.getIsSorted()}
                                                >
                                                    <span
                                                        class={`sort-indicator ${header.column.getIsSorted()}`}
                                                    />
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
                                                            cell.column
                                                                .columnDef.cell,
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
            </div>
        </>
    );
}
