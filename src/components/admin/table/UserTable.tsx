import { Show, For } from "solid-js";
import type { AdminUser, EditingField } from "../types";
import UserRow from "./UserRow";
import "./UserTable.css";

interface UserTableProps {
  users: AdminUser[];
  currentUserId: string | undefined;
  selectedIds: Set<string>;
  allSelected: boolean;
  editingField: EditingField | null;
  editValue: string;
  banningUserId: string | null;
  banReason: string;
  onToggleSelectAll: () => void;
  onToggleSelect: (userId: string) => void;
  onStartFieldEdit: (userId: string, field: "name" | "email" | "image", currentValue: string) => void;
  onSetEditingField: (value: EditingField | null) => void;
  onSetEditValue: (value: string) => void;
  onSaveField: () => void;
  onFieldKeyDown: (e: KeyboardEvent) => void;
  onSetRole: (userId: string, role: "user" | "admin") => void;
  onBanClick: (userId: string) => void;
  onUnban: (userId: string) => void;
  onDeleteClick: (userId: string, userName: string) => void;
  onSetBanReason: (value: string) => void;
  onConfirmBan: (userId: string) => void;
  onCancelBan: () => void;
  isFieldEditing: (userId: string, field: "name" | "email" | "image") => boolean;
}

export default function UserTable(props: UserTableProps) {
  return (
    <table class="admin-table">
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={props.allSelected}
              onChange={props.onToggleSelectAll}
            />
          </th>
          <th></th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <Show
          when={props.users.length > 0}
          fallback={
            <tr>
              <td colspan="7" class="admin-empty">
                No users found
              </td>
            </tr>
          }
        >
          <For each={props.users}>
            {(user) => {
              const isSelf = () => user.id === props.currentUserId;
              return (
                <UserRow
                  user={user}
                  isSelf={isSelf()}
                  isSelected={props.selectedIds.has(user.id)}
                  editingField={props.editingField}
                  editValue={props.editValue}
                  isBanning={props.banningUserId === user.id}
                  banReason={props.banReason}
                  onToggleSelect={() => props.onToggleSelect(user.id)}
                  onStartFieldEdit={(field, value) => props.onStartFieldEdit(user.id, field, value)}
                  onSetEditingField={props.onSetEditingField}
                  onSetEditValue={props.onSetEditValue}
                  onSaveField={props.onSaveField}
                  onFieldKeyDown={props.onFieldKeyDown}
                  onSetRole={(role) => props.onSetRole(user.id, role)}
                  onBanClick={() => props.onBanClick(user.id)}
                  onUnban={() => props.onUnban(user.id)}
                  onDeleteClick={() => props.onDeleteClick(user.id, user.name)}
                  onSetBanReason={props.onSetBanReason}
                  onConfirmBan={() => props.onConfirmBan(user.id)}
                  onCancelBan={props.onCancelBan}
                  isFieldEditing={(field) => props.isFieldEditing(user.id, field)}
                />
              );
            }}
          </For>
        </Show>
      </tbody>
    </table>
  );
}
