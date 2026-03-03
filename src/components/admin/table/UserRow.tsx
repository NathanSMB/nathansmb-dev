import { Show } from "solid-js";
import type { AdminUser, EditingField } from "../types";
import { isValidRole } from "../types";
import Avatar from "~/components/ui/Avatar";
import Button from "~/components/ui/Button";
import Checkbox from "~/components/ui/Checkbox";
import Pill from "~/components/ui/Pill";
import Select from "~/components/ui/Select";
import TextInput from "~/components/ui/TextInput";
import BanFormRow from "./BanFormRow";
import ImageFormRow from "./ImageFormRow";
import SetPasswordFormRow from "./SetPasswordFormRow";
import css from "./UserRow.css?inline";

interface UserRowProps {
  user: AdminUser;
  isSelf: boolean;
  isSelected: boolean;
  editingField: EditingField | null;
  editValue: string;
  isBanning: boolean;
  banReason: string;
  isSettingPassword: boolean;
  newPassword: string;
  onToggleSelect: () => void;
  onStartFieldEdit: (field: "name" | "email" | "image", currentValue: string) => void;
  onSetEditingField: (value: EditingField | null) => void;
  onSetEditValue: (value: string) => void;
  onSaveField: () => void;
  onFieldKeyDown: (e: KeyboardEvent) => void;
  onSetRole: (role: "user" | "admin") => void;
  onSetPasswordClick: () => void;
  onSetNewPassword: (value: string) => void;
  onConfirmSetPassword: () => void;
  onCancelSetPassword: () => void;
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
      <style>{css}</style>
      <tr>
        <td>
          <Checkbox checked={props.isSelected} onChange={props.onToggleSelect} disabled={props.isSelf} />
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
            fallback={<Pill color="success">Active</Pill>}
          >
            <Pill color="danger" title={props.user.banReason ?? undefined}>Banned</Pill>
          </Show>
        </td>
        <td>
          <div class="admin-actions">
            <Show when={!props.isSelf}>
              <Button color="neutral" onClick={props.onSetPasswordClick}>
                Set Password
              </Button>
            </Show>
            <Show
              when={props.user.banned}
              fallback={
                <Button
                  color="danger"
                  onClick={props.onBanClick}
                  disabled={props.isSelf}
                >
                  Ban
                </Button>
              }
            >
              <Button color="success" onClick={props.onUnban}>
                Unban
              </Button>
            </Show>
            <Show when={!props.isSelf}>
              <Button color="danger" onClick={props.onDeleteClick}>
                Delete
              </Button>
            </Show>
          </div>
        </td>
      </tr>
      <Show when={props.isFieldEditing("image")}>
        <ImageFormRow
          editValue={props.editValue}
          onSetEditValue={props.onSetEditValue}
          onSaveField={props.onSaveField}
          onCancel={() => props.onSetEditingField(null)}
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
      <Show when={props.isSettingPassword}>
        <SetPasswordFormRow
          newPassword={props.newPassword}
          onSetNewPassword={props.onSetNewPassword}
          onConfirm={props.onConfirmSetPassword}
          onCancel={props.onCancelSetPassword}
        />
      </Show>
    </>
  );
}
