import { type JSX } from "solid-js";
import { createColumnHelper, type ColumnDef } from "@tanstack/solid-table";
import type { AdminUser, EditingField } from "../types";
import Checkbox from "~/components/ui/Checkbox";
import Table from "~/components/ui/Table";
import UserRow from "./UserRow";
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
    const columnHelper = createColumnHelper<AdminUser>();

    const columns: ColumnDef<AdminUser, any>[] = [
        columnHelper.display({
            id: "select",
            header: (): JSX.Element => (
                <Checkbox
                    checked={props.allSelected}
                    onChange={props.onToggleSelectAll}
                />
            ),
            enableSorting: false,
            size: 44,
            minSize: 44,
        }),
        columnHelper.display({
            id: "avatar",
            header: "",
            enableSorting: false,
            size: 44,
            minSize: 44,
        }),
        columnHelper.accessor("name", {
            header: "Name",
            size: 160,
            minSize: 120,
        }),
        columnHelper.accessor("email", {
            header: "Email",
            size: 220,
            minSize: 150,
        }),
        columnHelper.accessor("role", {
            header: "Role",
            size: 100,
            minSize: 90,
        }),
        columnHelper.accessor("banned", {
            header: "Status",
            size: 90,
            minSize: 80,
        }),
        columnHelper.display({
            id: "actions",
            header: "Actions",
            enableSorting: false,
            size: 280,
            minSize: 200,
        }),
    ];

    return (
        <>
            <style>{css}</style>
            <Table
                data={props.users}
                columns={columns}
                sortBy={props.sortBy ?? undefined}
                sortDirection={props.sortDirection}
                onSort={(field) => props.onSort(field as SortableField)}
                emptyMessage="No users found"
                renderRow={(row) => {
                    const user = row.original;
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
                            isSettingPassword={
                                props.settingPasswordUserId === user.id
                            }
                            newPassword={props.newPassword}
                            onToggleSelect={() => props.onToggleSelect(user.id)}
                            onStartFieldEdit={(field, value) =>
                                props.onStartFieldEdit(user.id, field, value)
                            }
                            onSetEditingField={props.onSetEditingField}
                            onSetEditValue={props.onSetEditValue}
                            onSaveField={props.onSaveField}
                            onFieldKeyDown={props.onFieldKeyDown}
                            onSetRole={(role) => props.onSetRole(user.id, role)}
                            onSetPasswordClick={() =>
                                props.onSetPasswordClick(user.id)
                            }
                            onSetNewPassword={props.onSetNewPassword}
                            onConfirmSetPassword={() =>
                                props.onConfirmSetPassword(user.id)
                            }
                            onCancelSetPassword={props.onCancelSetPassword}
                            onBanClick={() => props.onBanClick(user.id)}
                            onUnban={() => props.onUnban(user.id)}
                            onDeleteClick={() =>
                                props.onDeleteClick(user.id, user.name)
                            }
                            onSetBanReason={props.onSetBanReason}
                            onConfirmBan={() => props.onConfirmBan(user.id)}
                            onCancelBan={props.onCancelBan}
                            isFieldEditing={(field) =>
                                props.isFieldEditing(user.id, field)
                            }
                        />
                    );
                }}
            />
        </>
    );
}
