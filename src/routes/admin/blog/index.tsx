import { createSignal, createEffect, on, Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { BlogTable, type BlogPostRow } from "~/components/admin/blog-table";
import { Pagination } from "~/components/admin/table";
import ConfirmModal from "~/components/ui/ConfirmModal";
import Button from "~/components/ui/Button";
import Form from "~/components/ui/Form";
import TextInput from "~/components/ui/TextInput";
import Select from "~/components/ui/Select";
import Banner from "~/components/ui/Banner";
import Spinner from "~/components/ui/Spinner";
import "../admin.css";

const STATUS_OPTIONS = [
    { value: "", label: "All statuses" },
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
];

export default function AdminBlog() {
    const navigate = useNavigate();
    const [posts, setPosts] = createSignal<BlogPostRow[]>([]);
    const [total, setTotal] = createSignal(0);
    const [page, setPage] = createSignal(0);
    const [pageSize, setPageSize] = createSignal(10);
    const [search, setSearch] = createSignal("");
    const [statusFilter, setStatusFilter] = createSignal("");
    const [sortBy, setSortBy] = createSignal("createdAt");
    const [sortDirection, setSortDirection] = createSignal<"asc" | "desc">(
        "desc",
    );
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal("");
    const [success, setSuccess] = createSignal("");
    const [deleteTarget, setDeleteTarget] = createSignal<{
        id: string;
        title: string;
    } | null>(null);
    const [deleteLoading, setDeleteLoading] = createSignal(false);

    const totalPages = () => Math.max(1, Math.ceil(total() / pageSize()));

    async function fetchPosts() {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
            limit: String(pageSize()),
            offset: String(page() * pageSize()),
            sortBy: sortBy(),
            sortDirection: sortDirection(),
        });
        if (search()) params.set("search", search());
        if (statusFilter()) params.set("status", statusFilter());

        try {
            const res = await fetch(`/api/admin/blog?${params}`);
            if (!res.ok) throw new Error("Failed to load posts");
            const data = await res.json();
            setPosts(data.posts);
            setTotal(data.total);
        } catch (e: any) {
            setError(e.message ?? "Failed to load posts");
        } finally {
            setLoading(false);
        }
    }

    createEffect(
        on([page, pageSize, sortBy, sortDirection, statusFilter], () =>
            fetchPosts(),
        ),
    );

    function handleSort(field: string) {
        if (sortBy() === field) {
            setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(field);
            setSortDirection("asc");
        }
        setPage(0);
    }

    function handleSearch(e: Event) {
        e.preventDefault();
        setPage(0);
        fetchPosts();
    }

    async function confirmDelete() {
        const target = deleteTarget();
        if (!target) return;

        setDeleteLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`/api/admin/blog/${target.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete post");

            setSuccess("Post deleted");
            setPosts((prev) => prev.filter((p) => p.id !== target.id));
            setTotal((prev) => prev - 1);
        } catch (e: any) {
            setError(e.message ?? "Failed to delete post");
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    }

    return (
        <main class="admin-page">
            <Title>Blog management</Title>
            <h1>Blog management</h1>

            <Banner variant="error" message={error()} />
            <Banner variant="success" message={success()} />

            <div class="admin-toolbar">
                <Form
                    variant="inline"
                    class="admin-search-form"
                    onSubmit={handleSearch}
                >
                    <TextInput
                        size="md"
                        placeholder="Search by title..."
                        value={search()}
                        onInput={setSearch}
                    />
                    <Button type="submit">Search</Button>
                </Form>
                <Select
                    value={statusFilter()}
                    options={STATUS_OPTIONS}
                    onChange={(v) => {
                        setStatusFilter(v);
                        setPage(0);
                    }}
                />
                <Button onClick={() => navigate("/admin/blog/new")}>
                    New Post
                </Button>
            </div>

            <Show when={!loading()} fallback={<Spinner size="lg" />}>
                <BlogTable
                    posts={posts()}
                    sortBy={sortBy()}
                    sortDirection={sortDirection()}
                    onSort={handleSort}
                    onEdit={(id) => navigate(`/admin/blog/${id}`)}
                    onDelete={(id, title) => setDeleteTarget({ id, title })}
                />
                <Pagination
                    page={page()}
                    totalPages={totalPages()}
                    hasPrevious={page() > 0}
                    hasNext={(page() + 1) * pageSize() < total()}
                    pageSize={pageSize()}
                    onFirst={() => setPage(0)}
                    onPrevious={() => setPage((p) => p - 1)}
                    onNext={() => setPage((p) => p + 1)}
                    onLast={() => setPage(totalPages() - 1)}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(0);
                    }}
                />
            </Show>

            <ConfirmModal
                open={deleteTarget() !== null}
                title="Delete Post"
                message="This will permanently delete this blog post."
                details={deleteTarget() ? `Post: ${deleteTarget()!.title}` : ""}
                confirmLabel="Yes, delete this post"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleteLoading()}
            />
        </main>
    );
}
