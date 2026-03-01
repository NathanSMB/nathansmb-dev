import { Show } from "solid-js";
import type { AdminUser, EditingField } from "../types";
import { isValidRole } from "../types";
import Avatar from "~/components/Avatar";
import Button from "~/components/ui/Button";
import Select from "~/components/ui/Select";
import TextInput from "~/components/ui/TextInput";
import BanFormRow from "./BanFormRow";
import EditFormRow from "./EditFormRow";
import "./UserRow.css";

interface UserRowProps {
  user: AdminUser;
  isSelf: boolean;
  isSelected: boolean;
  editingField: EditingField | null;
  editValue: string;
  isBanning: boolean;
  banReason: string;
  onToggleSelect: () => void;
  onStartFieldEdit: (field: "name" | "email" | "image", currentValue: string) => void;
  onSetEditingField: (value: EditingField | null) => void;
  onSetEditValue: (value: string) => void;
  onSaveField: () => void;
  onFieldKeyDown: (e: KeyboardEvent) => void;
  onSetRole: (role: "user" | "admin") => void;
  onBanClick: () => void;
  onUnban: () => void;
  onDeleteClick: () => void;
  onSetBanReason: (value: string) => void;
  onConfirmBan: () => void;
  onCancelBan: () => void;
  isFieldEditing: (field: "name" | "email" | "image") => boolean;
}

const roleOptions = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

export default function UserRow(props: UserRowProps) {
  return (
    <>
      <tr>
        <td>
          <input
            type="checkbox"
            checked={props.isSelected}
            onChange={props.onToggleSelect}
            disabled={props.isSelf}
          />
        </td>
        <td>
          <div
            class="avatar-cell"
            onMouseDown={(e) => { if (props.isFieldEditing("image")) e.preventDefault(); }}
            onClick={() => props.isFieldEditing("image") ? props.onSetEditingField(null) : props.onStartFieldEdit("image", props.user.image ?? "")}
            title="Edit image URL"
          >
            <Avatar image={props.user.image} name={props.user.name} />
            <span class="avatar-overlay">&#9998;</span>
          </div>
        </td>
        <td>
          <Show
            when={props.isFieldEditing("name")}
            fallback={
              <span
                class="click-to-edit"
                onClick={() => props.onStartFieldEdit("name", props.user.name)}
                title="Click to edit"
              >
                {props.user.name}
              </span>
            }
          >
            <TextInput
              variant="inline"
              value={props.editValue}
              onInput={props.onSetEditValue}
              onBlur={props.onSaveField}
              onKeyDown={props.onFieldKeyDown}
              ref={(el) => setTimeout(() => el.focus(), 0)}
            />
          </Show>
        </td>
        <td>
          <Show
            when={props.isFieldEditing("email")}
            fallback={
              <span
                class="click-to-edit"
                onClick={() => props.onStartFieldEdit("email", props.user.email)}
                title="Click to edit"
              >
                {props.user.email}
              </span>
            }
          >
            <TextInput
              variant="inline"
              type="email"
              value={props.editValue}
              onInput={props.onSetEditValue}
              onBlur={props.onSaveField}
              onKeyDown={props.onFieldKeyDown}
              ref={(el) => setTimeout(() => el.focus(), 0)}
            />
          </Show>
        </td>
        <td>
          <Select
            value={props.user.role ?? "user"}
            options={roleOptions}
            onChange={(value) => {
              if (isValidRole(value)) props.onSetRole(value);
            }}
            disabled={props.isSelf}
          />
        </td>
        <td>
          <Show
            when={props.user.banned}
            fallback={<span class="active-badge">Active</span>}
          >
            <span class="banned-badge" title={props.user.banReason ?? undefined}>Banned</span>
          </Show>
        </td>
        <td>
          <div class="admin-actions">
            <Show
              when={props.user.banned}
              fallback={
                <Button
                  variant="danger"
                  onClick={props.onBanClick}
                  disabled={props.isSelf}
                >
                  Ban
                </Button>
              }
            >
              <Button variant="success" onClick={props.onUnban}>
                Unban
              </Button>
            </Show>
            <Show when={!props.isSelf}>
              <Button variant="danger" onClick={props.onDeleteClick}>
                Delete
              </Button>
            </Show>
          </div>
        </td>
      </tr>
      <Show when={props.isFieldEditing("image")}>
        <EditFormRow
          editValue={props.editValue}
          onSetEditValue={props.onSetEditValue}
          onSaveField={props.onSaveField}
          onFieldKeyDown={props.onFieldKeyDown}
        />
      </Show>
      <Show when={props.isBanning}>
        <BanFormRow
          banReason={props.banReason}
          onSetBanReason={props.onSetBanReason}
          onConfirm={props.onConfirmBan}
          onCancel={props.onCancelBan}
        />
      </Show>
    </>
  );
}
