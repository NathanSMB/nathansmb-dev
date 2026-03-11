import Button from "~/components/ui/Button";
import css from "./BanFormRow.css?inline";
import TextInput from "~/components/ui/TextInput";
import FormLabel from "~/components/ui/FormLabel";
import Form from "~/components/ui/Form";

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
                    <Form onSubmit={props.onConfirm} variant="inline">
                        <FormLabel for="ban-reason">Ban Reason:</FormLabel>
                        <TextInput
                            id="ban-reason"
                            type="text"
                            size="lg"
                            placeholder="Ban reason (optional)"
                            value={props.banReason}
                            onInput={(value) => props.onSetBanReason(value)}
                        />
                        <Button color="danger" type="submit">
                            Confirm ban
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
