import { createSignal, createEffect, on, Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { authClient } from "~/auth/auth-client";
import ConfirmModal from "~/components/admin/ConfirmModal";
import type { AdminUser, EditingField, Role } from "~/components/admin/types";
import Button from "~/components/ui/Button";
import Form from "~/components/ui/Form";
import Select from "~/components/ui/Select";
import TextInput from "~/components/ui/TextInput";
import { UserTable, BatchBar, Pagination } from "~/components/admin/table";
import Banner from "~/components/ui/Banner";
import Spinner from "~/components/ui/Spinner";
import { consumeBatchStream } from "~/utils/batch-stream";
import "./admin.css";

export default function Admin() {
    const session = authClient.useSession();

    const [users, setUsers] = createSignal<AdminUser[]>([]);
    const [total, setTotal] = createSignal(0);
    const [page, setPage] = createSignal(0);
    const [pageSize, setPageSize] = createSignal(10);
    const [search, setSearch] = createSignal("");
    const [searchField, setSearchField] = createSignal<"name" | "email">(
        "name",
    );
    const [roleFilter, setRoleFilter] = createSignal("");
    const [loading, setLoading] = createSignal(false);
    const [error, setError] = createSignal("");
    const [success, setSuccess] = createSignal("");
    const [banningUserId, setBanningUserId] = createSignal<string | null>(null);
    const [banReason, setBanReason] = createSignal("");
    const [settingPasswordUserId, setSettingPasswordUserId] = createSignal<
        string | null
    >(null);
    const [newPassword, setNewPassword] = createSignal("");
    const [selectedIds, setSelectedIds] = createSignal<Set<string>>(new Set());
    const [batchRole, setBatchRole] = createSignal<Role>("user");
    const [batchBanReason, setBatchBanReason] = createSignal("");
    const [sortBy, setSortBy] = createSignal<string | null>(null);
    const [sortDirection, setSortDirection] = createSignal<"asc" | "desc">(
        "asc",
    );
    const [editingField, setEditingField] = createSignal<EditingField | null>(
        null,
    );
    const [editValue, setEditValue] = createSignal("");
    const [deleteTarget, setDeleteTarget] = createSignal<
        | { mode: "single"; userId: string; userName: string }
        | { mode: "batch"; userIds: string[]; count: number }
        | null
    >(null);
    const [deleteLoading, setDeleteLoading] = createSignal(false);
    const [batchProgress, setBatchProgress] = createSignal<{
        current: number;
        total: number;
        label: string;
    } | null>(null);

    const currentUserId = () => session()?.data?.user?.id;
    const totalPages = () => Math.max(1, Math.ceil(total() / pageSize()));

    async function fetchUsers() {
        setLoading(true);
        setError("");

        const query: Record<string, unknown> = {
            limit: pageSize(),
            offset: page() * pageSize(),
        };

        if (search()) {
            query.searchField = searchField();
            query.searchValue = search();
            query.searchOperator = "contains";
        }

        if (roleFilter()) {
            query.filterField = "role";
            query.filterValue = roleFilter();
            query.filterOperator = "eq";
        }

        if (sortBy()) {
            query.sortBy = sortBy();
            query.sortDirection = sortDirection();
        }

        const result = await authClient.admin.listUsers({ query });
        setLoading(false);

        if (result.error) {
            setError(result.error.message ?? "Failed to load users");
        } else if (result.data) {
            setUsers(result.data.users as AdminUser[]);
            setTotal(result.data.total);
            setSelectedIds(new Set<string>());
        }
    }

    createEffect(
        on([page, roleFilter, pageSize, sortBy, sortDirection], () =>
            fetchUsers(),
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
        fetchUsers();
    }

    function toggleSelect(userId: string) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    }

    function toggleSelectAll() {
        const selectable = users().filter((u) => u.id !== currentUserId());
        if (selectedIds().size === selectable.length) {
            setSelectedIds(new Set<string>());
        } else {
            setSelectedIds(new Set(selectable.map((u) => u.id)));
        }
    }

    const allSelected = () => {
        const selectable = users().filter((u) => u.id !== currentUserId());
        return (
            selectable.length > 0 && selectedIds().size === selectable.length
        );
    };

    async function handleSetRole(userId: string, newRole: Role) {
        setError("");
        setSuccess("");
        const result = await authClient.admin.setRole({
            userId,
            role: newRole,
        });
        if (result.error) {
            setError(result.error.message ?? "Failed to update role");
        } else {
            setSuccess("Role updated");
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, role: newRole } : u,
                ),
            );
        }
    }

    async function handleBan(userId: string) {
        setError("");
        setSuccess("");
        const reason = banReason();
        const result = await authClient.admin.banUser({
            userId,
            banReason: reason || undefined,
        });
        if (result.error) {
            setError(result.error.message ?? "Failed to ban user");
        } else {
            setSuccess("User banned");
            setBanningUserId(null);
            setBanReason("");
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId
                        ? { ...u, banned: true, banReason: reason || null }
                        : u,
                ),
            );
        }
    }

    async function handleUnban(userId: string) {
        setError("");
        setSuccess("");
        const result = await authClient.admin.unbanUser({ userId });
        if (result.error) {
            setError(result.error.message ?? "Failed to unban user");
        } else {
            setSuccess("User unbanned");
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId
                        ? { ...u, banned: false, banReason: null }
                        : u,
                ),
            );
        }
    }

    async function handleSetPassword(userId: string) {
        setError("");
        setSuccess("");
        const password = newPassword();
        const result = await authClient.admin.setUserPassword({
            userId,
            newPassword: password,
        });
        if (result.error) {
            setError(result.error.message ?? "Failed to set password");
        } else {
            setSuccess("Password updated");
            setSettingPasswordUserId(null);
            setNewPassword("");
        }
    }

    function startFieldEdit(
        userId: string,
        field: "name" | "email" | "image",
        currentValue: string,
    ) {
        setEditingField({ userId, field });
        setEditValue(currentValue);
    }

    async function saveField() {
        const ef = editingField();
        if (!ef) return;

        const user = users().find((u) => u.id === ef.userId);
        if (!user) return;

        const currentVal =
            ef.field === "image" ? (user.image ?? "") : user[ef.field];
        if (editValue() === currentVal) {
            setEditingField(null);
            return;
        }

        setError("");
        setSuccess("");

        const data: Record<string, unknown> = {};
        if (ef.field === "image") {
            data.image = editValue() || null;
        } else {
            data[ef.field] = editValue();
        }

        const result = await authClient.admin.updateUser({
            userId: ef.userId,
            data,
        });
        if (result.error) {
            setError(result.error.message ?? "Failed to update user");
        } else {
            setSuccess(
                `${ef.field.charAt(0).toUpperCase() + ef.field.slice(1)} updated`,
            );
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === ef.userId
                        ? {
                              ...u,
                              [ef.field]:
                                  ef.field === "image"
                                      ? editValue() || null
                                      : editValue(),
                          }
                        : u,
                ),
            );
        }
        setEditingField(null);
    }

    function handleFieldKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            saveField();
        } else if (e.key === "Escape") {
            setEditingField(null);
        }
    }

    function isFieldEditing(userId: string, field: "name" | "email" | "image") {
        const ef = editingField();
        return ef !== null && ef.userId === userId && ef.field === field;
    }

    async function handleBatchSetRole() {
        if (batchProgress()) return;
        setError("");
        setSuccess("");
        const ids = [...selectedIds()];
        const role = batchRole();

        setBatchProgress({
            current: 0,
            total: ids.length,
            label: "Setting roles",
        });

        await consumeBatchStream(
            "/api/admin/batch/set-role",
            { userIds: ids, role },
            (p) =>
                setBatchProgress({
                    current: p.completed,
                    total: p.total,
                    label: "Setting roles",
                }),
            (result) => {
                setBatchProgress(null);
                if (result.failedCount > 0) {
                    setError(
                        `Failed to update role for ${result.failedCount} user(s)`,
                    );
                }
                if (result.succeededIds.length > 0) {
                    setSuccess(
                        `Role set to "${role}" for ${result.succeededIds.length} user(s)`,
                    );
                    const succeeded = new Set(result.succeededIds);
                    setUsers((prev) =>
                        prev.map((u) =>
                            succeeded.has(u.id) ? { ...u, role } : u,
                        ),
                    );
                }
                setSelectedIds(new Set<string>());
            },
            (msg) => {
                setBatchProgress(null);
                setError(msg);
            },
        );
    }

    async function handleBatchBan() {
        if (batchProgress()) return;
        setError("");
        setSuccess("");
        const ids = [...selectedIds()];
        const reason = batchBanReason();

        setBatchProgress({
            current: 0,
            total: ids.length,
            label: "Banning users",
        });

        await consumeBatchStream(
            "/api/admin/batch/ban",
            { userIds: ids, banReason: reason || undefined },
            (p) =>
                setBatchProgress({
                    current: p.completed,
                    total: p.total,
                    label: "Banning users",
                }),
            (result) => {
                setBatchProgress(null);
                if (result.failedCount > 0) {
                    setError(`Failed to ban ${result.failedCount} user(s)`);
                }
                if (result.succeededIds.length > 0) {
                    setSuccess(`Banned ${result.succeededIds.length} user(s)`);
                    const succeeded = new Set(result.succeededIds);
                    setUsers((prev) =>
                        prev.map((u) =>
                            succeeded.has(u.id)
                                ? {
                                      ...u,
                                      banned: true,
                                      banReason: reason || null,
                                  }
                                : u,
                        ),
                    );
                }
                setSelectedIds(new Set<string>());
                setBatchBanReason("");
            },
            (msg) => {
                setBatchProgress(null);
                setError(msg);
            },
        );
    }

    async function handleBatchUnban() {
        if (batchProgress()) return;
        setError("");
        setSuccess("");
        const ids = [...selectedIds()];

        setBatchProgress({
            current: 0,
            total: ids.length,
            label: "Unbanning users",
        });

        await consumeBatchStream(
            "/api/admin/batch/unban",
            { userIds: ids },
            (p) =>
                setBatchProgress({
                    current: p.completed,
                    total: p.total,
                    label: "Unbanning users",
                }),
            (result) => {
                setBatchProgress(null);
                if (result.failedCount > 0) {
                    setError(`Failed to unban ${result.failedCount} user(s)`);
                }
                if (result.succeededIds.length > 0) {
                    setSuccess(
                        `Unbanned ${result.succeededIds.length} user(s)`,
                    );
                    const succeeded = new Set(result.succeededIds);
                    setUsers((prev) =>
                        prev.map((u) =>
                            succeeded.has(u.id)
                                ? { ...u, banned: false, banReason: null }
                                : u,
                        ),
                    );
                }
                setSelectedIds(new Set<string>());
            },
            (msg) => {
                setBatchProgress(null);
                setError(msg);
            },
        );
    }

    async function confirmDelete() {
        const target = deleteTarget();
        if (!target) return;

        setDeleteLoading(true);
        setError("");
        setSuccess("");

        if (target.mode === "single") {
            const result = await authClient.admin.removeUser({
                userId: target.userId,
            });
            setDeleteLoading(false);
            setDeleteTarget(null);

            if (result.error) {
                setError(result.error.message ?? "Failed to delete user");
            } else {
                setSuccess("User deleted");
                setUsers((prev) => prev.filter((u) => u.id !== target.userId));
                setTotal((prev) => prev - 1);
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(target.userId);
                    return next;
                });
            }
        } else {
            setDeleteLoading(false);
            setDeleteTarget(null);
            setBatchProgress({
                current: 0,
                total: target.userIds.length,
                label: "Deleting users",
            });

            await consumeBatchStream(
                "/api/admin/batch/delete",
                { userIds: target.userIds },
                (p) =>
                    setBatchProgress({
                        current: p.completed,
                        total: p.total,
                        label: "Deleting users",
                    }),
                (result) => {
                    setBatchProgress(null);
                    if (result.failedCount > 0)
                        setError(
                            `Failed to delete ${result.failedCount} user(s)`,
                        );
                    if (result.succeededIds.length > 0)
                        setSuccess(
                            `Deleted ${result.succeededIds.length} user(s)`,
                        );
                    setSelectedIds(new Set<string>());
                    fetchUsers();
                },
                (msg) => {
                    setBatchProgress(null);
                    setError(msg);
                },
            );
        }
    }

    function deleteModalProps() {
        const target = deleteTarget();
        if (!target)
            return { title: "", message: "", details: "", confirmLabel: "" };
        if (target.mode === "single") {
            return {
                title: "Permanently Delete User",
                message:
                    "This action cannot be undone. All their data, sessions, and accounts will be permanently destroyed.",
                details: `User: ${target.userName}`,
                confirmLabel: "Yes, delete this user",
            };
        }
        return {
            title: `Permanently Delete ${target.count} Users`,
            message:
                "This action cannot be undone. All data, sessions, and accounts for these users will be permanently destroyed.",
            details: `${target.count} user(s) will be permanently removed.`,
            confirmLabel: `Yes, delete ${target.count} user(s)`,
        };
    }

    return (
        <main class="admin-page">
            <Title>User management</Title>
            <h1>User management</h1>

            <Banner variant="error" message={error()} />
            <Banner variant="success" message={success()} />

            <div class="admin-toolbar">
                <Form
                    variant="inline"
                    class="admin-search-form"
                    onSubmit={handleSearch}
                >
                    <TextInput
                        variant="toolbar"
                        placeholder={`Search by ${searchField()}...`}
                        value={search()}
                        onInput={setSearch}
                    />
                    <Select
                        value={searchField()}
                        options={[
                            { value: "name", label: "Name" },
                            { value: "email", label: "Email" },
                        ]}
                        onChange={(v) => setSearchField(v as "name" | "email")}
                    />
                    <Button type="submit">Search</Button>
                </Form>
                <Select
                    value={roleFilter()}
                    options={[
                        { value: "", label: "All roles" },
                        { value: "user", label: "User" },
                        { value: "admin", label: "Admin" },
                    ]}
                    onChange={(v) => {
                        setRoleFilter(v);
                        setPage(0);
                    }}
                />
            </div>

            <Show when={!loading()} fallback={<Spinner size="lg" />}>
                <UserTable
                    users={users()}
                    currentUserId={currentUserId()}
                    selectedIds={selectedIds()}
                    allSelected={allSelected()}
                    sortBy={sortBy()}
                    sortDirection={sortDirection()}
                    onSort={handleSort}
                    editingField={editingField()}
                    editValue={editValue()}
                    banningUserId={banningUserId()}
                    banReason={banReason()}
                    settingPasswordUserId={settingPasswordUserId()}
                    newPassword={newPassword()}
                    onToggleSelectAll={toggleSelectAll}
                    onToggleSelect={toggleSelect}
                    onStartFieldEdit={startFieldEdit}
                    onSetEditingField={setEditingField}
                    onSetEditValue={setEditValue}
                    onSaveField={saveField}
                    onFieldKeyDown={handleFieldKeyDown}
                    onSetRole={handleSetRole}
                    onSetPasswordClick={(userId) => {
                        setSettingPasswordUserId(
                            settingPasswordUserId() === userId ? null : userId,
                        );
                        setNewPassword("");
                        setBanningUserId(null);
                        setBanReason("");
                    }}
                    onSetNewPassword={setNewPassword}
                    onConfirmSetPassword={handleSetPassword}
                    onCancelSetPassword={() => {
                        setSettingPasswordUserId(null);
                        setNewPassword("");
                    }}
                    onBanClick={(userId) => {
                        setBanningUserId(
                            banningUserId() === userId ? null : userId,
                        );
                        setBanReason("");
                        setSettingPasswordUserId(null);
                        setNewPassword("");
                    }}
                    onUnban={handleUnban}
                    onDeleteClick={(userId, userName) =>
                        setDeleteTarget({
                            mode: "single",
                            userId,
                            userName,
                        })
                    }
                    onSetBanReason={setBanReason}
                    onConfirmBan={handleBan}
                    onCancelBan={() => setBanningUserId(null)}
                    isFieldEditing={isFieldEditing}
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

            <Show when={selectedIds().size > 0}>
                <BatchBar
                    selectedCount={selectedIds().size}
                    batchProgress={batchProgress()}
                    batchRole={batchRole()}
                    batchBanReason={batchBanReason()}
                    onSetBatchRole={setBatchRole}
                    onBatchSetRole={handleBatchSetRole}
                    onSetBatchBanReason={setBatchBanReason}
                    onBatchBan={handleBatchBan}
                    onBatchUnban={handleBatchUnban}
                    onBatchDelete={() => {
                        const ids = [...selectedIds()];
                        setDeleteTarget({
                            mode: "batch",
                            userIds: ids,
                            count: ids.length,
                        });
                    }}
                />
            </Show>

            <ConfirmModal
                open={deleteTarget() !== null}
                title={deleteModalProps().title}
                message={deleteModalProps().message}
                details={deleteModalProps().details}
                confirmLabel={deleteModalProps().confirmLabel}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleteLoading()}
            />
        </main>
    );
}
