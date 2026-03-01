import Button from "~/components/ui/Button";
import css from "./BanFormRow.css?inline";

interface BanFormRowProps {
  banReason: string;
  onSetBanReason: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BanFormRow(props: BanFormRowProps) {
  return (
    <tr class="ban-form-row">
      <style>{css}</style>
      <td colspan="7">
        <div class="ban-form">
          <input
            type="text"
            placeholder="Ban reason (optional)"
            value={props.banReason}
            onInput={(e) => props.onSetBanReason(e.currentTarget.value)}
          />
          <Button variant="danger" onClick={props.onConfirm}>
            Confirm ban
          </Button>
          <Button variant="nuetral" onClick={props.onCancel}>
            Cancel
          </Button>
        </div>
      </td>
    </tr>
  );
}
