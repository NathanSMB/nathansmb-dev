import TextInput from "~/components/ui/TextInput";

interface EditFormRowProps {
  editValue: string;
  onSetEditValue: (value: string) => void;
  onSaveField: () => void;
  onFieldKeyDown: (e: KeyboardEvent) => void;
}

export default function EditFormRow(props: EditFormRowProps) {
  return (
    <tr class="edit-form-row">
      <td colspan="7">
        <div class="edit-form">
          <label class="edit-form-label">Image URL</label>
          <TextInput
            type="url"
            placeholder="https://example.com/photo.jpg"
            value={props.editValue}
            onInput={props.onSetEditValue}
            onBlur={props.onSaveField}
            onKeyDown={props.onFieldKeyDown}
            ref={(el) => setTimeout(() => el.focus(), 0)}
          />
        </div>
      </td>
    </tr>
  );
}
