import { Show, For } from "solid-js";
import type { AdminUser, EditingField } from "../types";
import Checkbox from "~/components/ui/Checkbox";
import UserRow from "./UserRow";
import sharedCss from "./admin-table.css?inline";
import css from "./UserTable.css?inline";

type SortableField = "name" | "email" | "role" | "banned";

interface UserTableProps {
    users: AdminUser[];
    currentUserId: string | undefined;
    selectedIds: Set<string>;
    allSelected: boolean;
    sortBy: string | null;
    sortDirection: "asc" | "desc";
    onSort: (field: SortableField) => void;
    editingField: EditingField | null;
    editValue: string;
    banningUserId: string | null;
    banReason: string;
    settingPasswordUserId: string | null;
    newPassword: string;
    onToggleSelectAll: () => void;
    onToggleSelect: (userId: string) => void;
    onStartFieldEdit: (
        userId: string,
        field: "name" | "email" | "image",
        currentValue: string,
    ) => void;
    onSetEditingField: (value: EditingField | null) => void;
    onSetEditValue: (value: string) => void;
    onSaveField: () => void;
    onFieldKeyDown: (e: KeyboardEvent) => void;
    onSetRole: (userId: string, role: "user" | "admin") => void;
    onSetPasswordClick: (userId: string) => void;
    onSetNewPassword: (value: string) => void;
    onConfirmSetPassword: (userId: string) => void;
    onCancelSetPassword: () => void;
    onBanClick: (userId: string) => void;
    onUnban: (userId: string) => void;
    onDeleteClick: (userId: string, userName: string) => void;
    onSetBanReason: (value: string) => void;
    onConfirmBan: (userId: string) => void;
    onCancelBan: () => void;
    isFieldEditing: (
        userId: string,
        field: "name" | "email" | "image",
    ) => boolean;
}

export default function UserTable(props: UserTableProps) {
    function sortIndicator(field: SortableField) {
        if (props.sortBy !== field) return "";
        return props.sortDirection === "asc" ? " \u25B2" : " \u25BC";
    }

    return (
        <>
            <style>{sharedCss + css}</style>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>
                            <Checkbox
                                checked={props.allSelected}
                                onChange={props.onToggleSelectAll}
                            />
                        </th>
                        <th></th>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("name")}
                        >
                            Name{sortIndicator("name")}
                        </th>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("email")}
                        >
                            Email{sortIndicator("email")}
                        </th>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("role")}
                        >
                            Role{sortIndicator("role")}
                        </th>
                        <th
                            class="sortable"
                            onClick={() => props.onSort("banned")}
                        >
                            Status{sortIndicator("banned")}
                        </th>
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
                                const isSelf = () =>
                                    user.id === props.currentUserId;
                                return (
                                    <UserRow
                                        user={user}
                                        isSelf={isSelf()}
                                        isSelected={props.selectedIds.has(
                                            user.id,
                                        )}
                                        editingField={props.editingField}
                                        editValue={props.editValue}
                                        isBanning={
                                            props.banningUserId === user.id
                                        }
                                        banReason={props.banReason}
                                        isSettingPassword={
                                            props.settingPasswordUserId ===
                                            user.id
                                        }
                                        newPassword={props.newPassword}
                                        onToggleSelect={() =>
                                            props.onToggleSelect(user.id)
                                        }
                                        onStartFieldEdit={(field, value) =>
                                            props.onStartFieldEdit(
                                                user.id,
                                                field,
                                                value,
                                            )
                                        }
                                        onSetEditingField={
                                            props.onSetEditingField
                                        }
                                        onSetEditValue={props.onSetEditValue}
                                        onSaveField={props.onSaveField}
                                        onFieldKeyDown={props.onFieldKeyDown}
                                        onSetRole={(role) =>
                                            props.onSetRole(user.id, role)
                                        }
                                        onSetPasswordClick={() =>
                                            props.onSetPasswordClick(user.id)
                                        }
                                        onSetNewPassword={
                                            props.onSetNewPassword
                                        }
                                        onConfirmSetPassword={() =>
                                            props.onConfirmSetPassword(user.id)
                                        }
                                        onCancelSetPassword={
                                            props.onCancelSetPassword
                                        }
                                        onBanClick={() =>
                                            props.onBanClick(user.id)
                                        }
                                        onUnban={() => props.onUnban(user.id)}
                                        onDeleteClick={() =>
                                            props.onDeleteClick(
                                                user.id,
                                                user.name,
                                            )
                                        }
                                        onSetBanReason={props.onSetBanReason}
                                        onConfirmBan={() =>
                                            props.onConfirmBan(user.id)
                                        }
                                        onCancelBan={props.onCancelBan}
                                        isFieldEditing={(field) =>
                                            props.isFieldEditing(user.id, field)
                                        }
                                    />
                                );
                            }}
                        </For>
                    </Show>
                </tbody>
            </table>
        </>
    );
}
