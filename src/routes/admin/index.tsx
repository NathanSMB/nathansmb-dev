import { createSignal, createEffect, on, Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { authClient } from "~/auth/auth-client";
import { requireAuth } from "~/auth/require-auth";
import ConfirmModal from "~/components/ConfirmModal";
import type { AdminUser, EditingField, Role } from "~/components/admin/types";
import Button from "~/components/ui/Button";
import Select from "~/components/ui/Select";
import TextInput from "~/components/ui/TextInput";
import { UserTable, BatchBar, Pagination } from "~/components/admin/table";
import "./admin.css";

export default function Admin() {
  const session = requireAuth({
    permissions: { user: ["list", "set-role", "ban", "update", "delete"] },
  });

  const [users, setUsers] = createSignal<AdminUser[]>([]);
  const [total, setTotal] = createSignal(0);
  const [page, setPage] = createSignal(0);
  const [pageSize, setPageSize] = createSignal(10);
  const [search, setSearch] = createSignal("");
  const [searchField, setSearchField] = createSignal<"name" | "email">("name");
  const [roleFilter, setRoleFilter] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal("");
  const [banningUserId, setBanningUserId] = createSignal<string | null>(null);
  const [banReason, setBanReason] = createSignal("");
  const [selectedIds, setSelectedIds] = createSignal<Set<string>>(new Set());
  const [batchRole, setBatchRole] = createSignal<Role>("user");
  const [batchBanReason, setBatchBanReason] = createSignal("");
  const [editingField, setEditingField] = createSignal<EditingField | null>(null);
  const [editValue, setEditValue] = createSignal("");
  const [deleteTarget, setDeleteTarget] = createSignal<
    | { mode: "single"; userId: string; userName: string }
    | { mode: "batch"; userIds: string[]; count: number }
    | null
  >(null);
  const [deleteLoading, setDeleteLoading] = createSignal(false);

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

  createEffect(on([page, roleFilter, pageSize], () => fetchUsers()));

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
    return selectable.length > 0 && selectedIds().size === selectable.length;
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
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
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
            : u
        )
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
            : u
        )
      );
    }
  }

  function startFieldEdit(userId: string, field: "name" | "email" | "image", currentValue: string) {
    setEditingField({ userId, field });
    setEditValue(currentValue);
  }

  async function saveField() {
    const ef = editingField();
    if (!ef) return;

    const user = users().find((u) => u.id === ef.userId);
    if (!user) return;

    const currentVal = ef.field === "image" ? (user.image ?? "") : user[ef.field];
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

    const result = await authClient.admin.updateUser({ userId: ef.userId, data });
    if (result.error) {
      setError(result.error.message ?? "Failed to update user");
    } else {
      setSuccess(`${ef.field.charAt(0).toUpperCase() + ef.field.slice(1)} updated`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === ef.userId
            ? { ...u, [ef.field]: ef.field === "image" ? (editValue() || null) : editValue() }
            : u
        )
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
    setError("");
    setSuccess("");
    const ids = [...selectedIds()];
    const role = batchRole();
    let failed = 0;

    for (const userId of ids) {
      const result = await authClient.admin.setRole({ userId, role });
      if (result.error) failed++;
    }

    if (failed > 0) {
      setError(`Failed to update role for ${failed} user(s)`);
    } else {
      setSuccess(`Role set to "${role}" for ${ids.length} user(s)`);
    }

    setUsers((prev) =>
      prev.map((u) =>
        ids.includes(u.id) ? { ...u, role } : u
      )
    );
    setSelectedIds(new Set<string>());
  }

  async function handleBatchBan() {
    setError("");
    setSuccess("");
    const ids = [...selectedIds()];
    const reason = batchBanReason();
    let failed = 0;

    for (const userId of ids) {
      const result = await authClient.admin.banUser({
        userId,
        banReason: reason || undefined,
      });
      if (result.error) failed++;
    }

    if (failed > 0) {
      setError(`Failed to ban ${failed} user(s)`);
    } else {
      setSuccess(`Banned ${ids.length} user(s)`);
    }

    setUsers((prev) =>
      prev.map((u) =>
        ids.includes(u.id)
          ? { ...u, banned: true, banReason: reason || null }
          : u
      )
    );
    setSelectedIds(new Set<string>());
    setBatchBanReason("");
  }

  async function handleBatchUnban() {
    setError("");
    setSuccess("");
    const ids = [...selectedIds()];
    let failed = 0;

    for (const userId of ids) {
      const result = await authClient.admin.unbanUser({ userId });
      if (result.error) failed++;
    }

    if (failed > 0) {
      setError(`Failed to unban ${failed} user(s)`);
    } else {
      setSuccess(`Unbanned ${ids.length} user(s)`);
    }

    setUsers((prev) =>
      prev.map((u) =>
        ids.includes(u.id) ? { ...u, banned: false, banReason: null } : u
      )
    );
    setSelectedIds(new Set<string>());
  }

  async function confirmDelete() {
    const target = deleteTarget();
    if (!target) return;

    setDeleteLoading(true);
    setError("");
    setSuccess("");

    if (target.mode === "single") {
      const result = await authClient.admin.removeUser({ userId: target.userId });
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
      let failed = 0;
      let succeeded = 0;

      for (const userId of target.userIds) {
        const result = await authClient.admin.removeUser({ userId });
        if (result.error) failed++;
        else succeeded++;
      }

      setDeleteLoading(false);
      setDeleteTarget(null);

      if (failed > 0) setError(`Failed to delete ${failed} user(s)`);
      if (succeeded > 0) setSuccess(`Deleted ${succeeded} user(s)`);

      setSelectedIds(new Set<string>());
      fetchUsers();
    }
  }

  function deleteModalProps() {
    const t = deleteTarget();
    if (!t) return { title: "", message: "", details: "", confirmLabel: "" };
    if (t.mode === "single") {
      return {
        title: "Permanently Delete User",
        message:
          "This action cannot be undone. All their data, sessions, and accounts will be permanently destroyed.",
        details: `User: ${t.userName}`,
        confirmLabel: "Yes, delete this user",
      };
    }
    return {
      title: `Permanently Delete ${t.count} Users`,
      message:
        "This action cannot be undone. All data, sessions, and accounts for these users will be permanently destroyed.",
      details: `${t.count} user(s) will be permanently removed.`,
      confirmLabel: `Yes, delete ${t.count} user(s)`,
    };
  }

  return (
    <main class="admin-page">
      <Title>User management</Title>
      <h1>User management</h1>

      <Show when={error()}>
        <div class="error">{error()}</div>
      </Show>
      <Show when={success()}>
        <div class="success">{success()}</div>
      </Show>

      <div class="admin-toolbar">
        <form onSubmit={handleSearch}>
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
          <Button variant="primary" type="submit">Search</Button>
        </form>
        <Select
          value={roleFilter()}
          options={[
            { value: "", label: "All roles" },
            { value: "user", label: "User" },
            { value: "admin", label: "Admin" },
          ]}
          onChange={(v) => { setRoleFilter(v); setPage(0); }}
        />
        <a href="/admin/tools/test-users" class="admin-tool-link">Generate test users</a>
      </div>

      <Show when={!loading()} fallback={<p class="admin-loading">Loading...</p>}>
        <UserTable
          users={users()}
          currentUserId={currentUserId()}
          selectedIds={selectedIds()}
          allSelected={allSelected()}
          editingField={editingField()}
          editValue={editValue()}
          banningUserId={banningUserId()}
          banReason={banReason()}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelect={toggleSelect}
          onStartFieldEdit={startFieldEdit}
          onSetEditingField={setEditingField}
          onSetEditValue={setEditValue}
          onSaveField={saveField}
          onFieldKeyDown={handleFieldKeyDown}
          onSetRole={handleSetRole}
          onBanClick={(userId) => {
            setBanningUserId(banningUserId() === userId ? null : userId);
            setBanReason("");
          }}
          onUnban={handleUnban}
          onDeleteClick={(userId, userName) =>
            setDeleteTarget({ mode: "single", userId, userName })
          }
          onSetBanReason={setBanReason}
          onConfirmBan={handleBan}
          onCancelBan={() => setBanningUserId(null)}
          isFieldEditing={isFieldEditing}
        />
      </Show>

      <Show when={total() > pageSize()}>
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
          onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
        />
      </Show>

      <Show when={selectedIds().size > 0}>
        <BatchBar
          selectedCount={selectedIds().size}
          batchRole={batchRole()}
          batchBanReason={batchBanReason()}
          onSetBatchRole={setBatchRole}
          onBatchSetRole={handleBatchSetRole}
          onSetBatchBanReason={setBatchBanReason}
          onBatchBan={handleBatchBan}
          onBatchUnban={handleBatchUnban}
          onBatchDelete={() => {
            const ids = [...selectedIds()];
            setDeleteTarget({ mode: "batch", userIds: ids, count: ids.length });
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
