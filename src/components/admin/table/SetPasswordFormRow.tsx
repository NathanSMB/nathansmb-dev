import Button from "~/components/ui/Button";
import css from "./SetPasswordFormRow.css?inline";
import TextInput from "~/components/ui/TextInput";
import FormLabel from "~/components/ui/FormLabel";
import Form from "~/components/ui/Form";

interface SetPasswordFormRowProps {
  newPassword: string;
  onSetNewPassword: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SetPasswordFormRow(props: SetPasswordFormRowProps) {
  return (
    <tr class="set-password-form-row">
      <style>{css}</style>
      <td colspan="7">
        <div class="set-password-form">

          <Form onSubmit={props.onConfirm} variant="inline">
            <FormLabel for="new-password">New Password:</FormLabel>
            <TextInput
              id="new-password"
              type="password"
              variant="form"
              placeholder="Enter new password"
              value={props.newPassword}
              onInput={(value) => props.onSetNewPassword(value)}
              required
            />
            <Button color="primary" type="submit">
              Confirm
            </Button>
            <Button color="neutral" onClick={props.onCancel}>
              Cancel
            </Button>
          </Form>
        </div>
      </td>
    </tr>
  );
}
