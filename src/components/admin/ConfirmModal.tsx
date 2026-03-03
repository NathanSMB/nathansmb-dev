import { Show, onCleanup, createEffect } from "solid-js";
import css from "./ConfirmModal.css?inline";

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    details?: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function ConfirmModal(props: ConfirmModalProps) {
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
                        class="modal-dialog modal-destructive"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div class="modal-icon">&#9888;</div>
                        <h2 class="modal-title">{props.title}</h2>
                        <p class="modal-message">{props.message}</p>
                        <Show when={props.details}>
                            <p class="modal-details">{props.details}</p>
                        </Show>
                        <div class="modal-actions">
                            <button
                                class="modal-cancel"
                                onClick={props.onCancel}
                                disabled={props.loading}
                            >
                                Cancel
                            </button>
                            <button
                                class="modal-confirm-destructive"
                                onClick={props.onConfirm}
                                disabled={props.loading}
                            >
                                {props.loading
                                    ? "Deleting..."
                                    : (props.confirmLabel ?? "Delete")}
                            </button>
                        </div>
                    </div>
                </div>
            </Show>
        </>
    );
}
