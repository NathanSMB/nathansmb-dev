import { createSignal, createEffect, on, Show, For } from "solid-js";
import { Title } from "@solidjs/meta";
import { authClient } from "~/auth/auth-client";
import { requireAuth } from "~/auth/require-auth";
import "./admin.css";

const PAGE_SIZE = 10;

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned: boolean | null;
  banReason?: string | null;
  banExpires?: number | null;
  image?: string | null;
  createdAt: Date;
}

export default function Admin() {
  const session = requireAuth({
    permissions: { user: ["list", "set-role", "ban"] },
  });

  const [users, setUsers] = createSignal<AdminUser[]>([]);
  const [total, setTotal] = createSignal(0);
  const [page, setPage] = createSignal(0);
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

  const currentUserId = () => session()?.data?.user?.id;
  const totalPages = () => Math.max(1, Math.ceil(total() / PAGE_SIZE));

  async function fetchUsers() {
    setLoading(true);
    setError("");

    const query: Record<string, unknown> = {
      limit: PAGE_SIZE,
      offset: page() * PAGE_SIZE,
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

  createEffect(on([page, roleFilter], () => fetchUsers()));

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

  type Role = "user" | "admin";
  const validRoles: Role[] = ["user", "admin"];

  function isValidRole(value: string): value is Role {
    return validRoles.includes(value as Role);
  }

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
    let failed = 0;

    for (const userId of ids) {
      const result = await authClient.admin.banUser({ userId });
      if (result.error) failed++;
    }

    if (failed > 0) {
      setError(`Failed to ban ${failed} user(s)`);
    } else {
      setSuccess(`Banned ${ids.length} user(s)`);
    }

    setUsers((prev) =>
      prev.map((u) =>
        ids.includes(u.id) ? { ...u, banned: true } : u
      )
    );
    setSelectedIds(new Set<string>());
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
          <input
            type="text"
            placeholder={`Search by ${searchField()}...`}
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
          <select
            value={searchField()}
            onChange={(e) =>
              setSearchField(e.currentTarget.value as "name" | "email")
            }
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
          </select>
          <button type="submit">Search</button>
        </form>
        <select
          value={roleFilter()}
          onChange={(e) => {
            setRoleFilter(e.currentTarget.value);
            setPage(0);
          }}
        >
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <Show when={!loading()} fallback={<p class="admin-loading">Loading...</p>}>
        <table class="admin-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allSelected()}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <Show
              when={users().length > 0}
              fallback={
                <tr>
                  <td colspan="6" class="admin-empty">
                    No users found
                  </td>
                </tr>
              }
            >
              <For each={users()}>
                {(user) => {
                  const isSelf = () => user.id === currentUserId();
                  return (
                    <>
                      <tr>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds().has(user.id)}
                            onChange={() => toggleSelect(user.id)}
                            disabled={isSelf()}
                          />
                        </td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            class="role-select"
                            value={user.role ?? "user"}
                            onChange={(e) => {
                              const value = e.currentTarget.value;
                              if (isValidRole(value)) handleSetRole(user.id, value);
                            }}
                            disabled={isSelf()}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <Show
                            when={user.banned}
                            fallback={
                              <span class="active-badge">Active</span>
                            }
                          >
                            <span class="banned-badge" title={user.banReason ?? undefined}>Banned</span>
                          </Show>
                        </td>
                        <td class="admin-actions">
                          <Show
                            when={user.banned}
                            fallback={
                              <button
                                class="ban-btn"
                                onClick={() => {
                                  setBanningUserId(
                                    banningUserId() === user.id
                                      ? null
                                      : user.id
                                  );
                                  setBanReason("");
                                }}
                                disabled={isSelf()}
                              >
                                Ban
                              </button>
                            }
                          >
                            <button
                              class="unban-btn"
                              onClick={() => handleUnban(user.id)}
                            >
                              Unban
                            </button>
                          </Show>
                        </td>
                      </tr>
                      <Show when={banningUserId() === user.id}>
                        <tr class="ban-form-row">
                          <td colspan="6">
                            <div class="ban-form">
                              <input
                                type="text"
                                placeholder="Ban reason (optional)"
                                value={banReason()}
                                onInput={(e) =>
                                  setBanReason(e.currentTarget.value)
                                }
                              />
                              <button
                                class="confirm-ban"
                                onClick={() => handleBan(user.id)}
                              >
                                Confirm ban
                              </button>
                              <button
                                class="cancel-ban"
                                onClick={() => setBanningUserId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      </Show>
                    </>
                  );
                }}
              </For>
            </Show>
          </tbody>
        </table>
      </Show>

      <Show when={total() > PAGE_SIZE}>
        <div class="admin-pagination">
          <button
            disabled={page() === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>
            Page {page() + 1} of {totalPages()}
          </span>
          <button
            disabled={(page() + 1) * PAGE_SIZE >= total()}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </Show>

      <Show when={selectedIds().size > 0}>
        <div class="admin-batch-bar">
          <span>{selectedIds().size} user(s) selected</span>
          <select
            value={batchRole()}
            onChange={(e) => {
              const value = e.currentTarget.value;
              if (isValidRole(value)) setBatchRole(value);
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleBatchSetRole}>Set role</button>
          <button class="batch-ban" onClick={handleBatchBan}>
            Ban selected
          </button>
          <button class="batch-unban" onClick={handleBatchUnban}>
            Unban selected
          </button>
        </div>
      </Show>
    </main>
  );
}
