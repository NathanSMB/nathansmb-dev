import { Show, onCleanup, createEffect, type JSX } from "solid-js";
import {
    TbOutlineAlertTriangle,
    TbOutlineInfoCircle,
    TbOutlineCircleCheck,
} from "solid-icons/tb";
import Button from "~/components/ui/Button";
import baseCss from "./modal-base.css?inline";
import formCss from "./FormModal.css?inline";

interface FormModalProps {
    open: boolean;
    title: string;
    message?: string;
    variant?: "danger" | "primary" | "success";
    confirmLabel?: string;
    onSubmit: () => void;
    onCancel: () => void;
    loading?: boolean;
    children: JSX.Element;
}

const variantIcon = {
    danger: () => <TbOutlineAlertTriangle />,
    primary: () => <TbOutlineInfoCircle />,
    success: () => <TbOutlineCircleCheck />,
};

export default function FormModal(props: FormModalProps) {
    const v = () => props.variant ?? "primary";

    createEffect(() => {
        if (!props.open) return;

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                e.stopPropagation();
                props.onCancel();
            }
        }

        document.addEventListener("keydown", onKeyDown);
        onCleanup(() => document.removeEventListener("keydown", onKeyDown));
    });

    return (
        <>
            <style>{baseCss}</style>
            <style>{formCss}</style>
            <Show when={props.open}>
                <div class="modal-backdrop" onClick={props.onCancel}>
                    <form
                        class={`modal-dialog modal-${v()}`}
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={(e) => {
                            e.preventDefault();
                            props.onSubmit();
                        }}
                    >
                        <div class={`modal-icon modal-icon-${v()}`}>
                            {variantIcon[v()]()}
                        </div>
                        <h2 class={`modal-title modal-title-${v()}`}>
                            {props.title}
                        </h2>
                        <Show when={props.message}>
                            <p class="modal-message">{props.message}</p>
                        </Show>
                        <div class="modal-form-body">{props.children}</div>
                        <div class="modal-actions">
                            <Button
                                color="neutral"
                                onClick={props.onCancel}
                                disabled={props.loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                color={v()}
                                type="submit"
                                disabled={props.loading}
                            >
                                {props.confirmLabel ?? "Submit"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Show>
        </>
    );
}
