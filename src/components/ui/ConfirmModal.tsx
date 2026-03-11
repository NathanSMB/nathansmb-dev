import { Show, onCleanup, createEffect } from "solid-js";
import {
    TbOutlineAlertTriangle,
    TbOutlineInfoCircle,
    TbOutlineCircleCheck,
} from "solid-icons/tb";
import Banner from "~/components/ui/Banner";
import Button from "~/components/ui/Button";
import css from "~/components/ui/modal-base.css?inline";

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    details?: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    variant?: "danger" | "primary" | "success";
}

const variantIcon = {
    danger: () => <TbOutlineAlertTriangle />,
    primary: () => <TbOutlineInfoCircle />,
    success: () => <TbOutlineCircleCheck />,
};

const bannerVariant = {
    danger: "error" as const,
    primary: "info" as const,
    success: "success" as const,
};

export default function ConfirmModal(props: ConfirmModalProps) {
    const v = () => props.variant ?? "danger";

    createEffect(() => {
        if (!props.open) return;

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") props.onCancel();
        }

        document.addEventListener("keydown", onKeyDown);
        onCleanup(() => document.removeEventListener("keydown", onKeyDown));
    });

    return (
        <>
            <style>{css}</style>
            <Show when={props.open}>
                <div class="modal-backdrop" onClick={props.onCancel}>
                    <div
                        class={`modal-dialog modal-${v()}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div class={`modal-icon modal-icon-${v()}`}>
                            {variantIcon[v()]()}
                        </div>
                        <h2 class={`modal-title modal-title-${v()}`}>
                            {props.title}
                        </h2>
                        <p class="modal-message">{props.message}</p>
                        <Banner
                            variant={bannerVariant[v()]}
                            message={props.details}
                        />
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
                                onClick={props.onConfirm}
                                disabled={props.loading}
                            >
                                {props.loading
                                    ? "Deleting..."
                                    : (props.confirmLabel ?? "Delete")}
                            </Button>
                        </div>
                    </div>
                </div>
            </Show>
        </>
    );
}
