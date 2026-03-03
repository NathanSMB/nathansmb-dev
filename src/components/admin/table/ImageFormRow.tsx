import Button from "~/components/ui/Button";
import TextInput from "~/components/ui/TextInput";
import css from "./ImageFormRow.css?inline";
import FormLabel from "~/components/ui/FormLabel";
import Form from "~/components/ui/Form";

interface ImageFormRowProps {
    editValue: string;
    onSetEditValue: (value: string) => void;
    onSaveField: () => void;
    onCancel: () => void;
    onFieldKeyDown: (e: KeyboardEvent) => void;
}

export default function ImageFormRow(props: ImageFormRowProps) {
    return (
        <tr class="image-form-row">
            <style>{css}</style>
            <td colspan="7">
                <div class="image-form">
                    <Form onSubmit={props.onSaveField} variant="inline">
                        <FormLabel for="image-url">Image URL:</FormLabel>
                        <TextInput
                            id="image-url"
                            type="url"
                            variant="form"
                            placeholder="https://example.com/photo.jpg"
                            value={props.editValue}
                            onInput={props.onSetEditValue}
                            onKeyDown={props.onFieldKeyDown}
                            ref={(el) => setTimeout(() => el.focus(), 0)}
                        />
                        <Button color="success" type="submit">
                            Save
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
