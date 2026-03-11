import { createSignal, Show } from "solid-js";
import type { CommentData } from "~/routes/api/comments";
import MarkdownEditor from "~/components/ui/MarkdownEditor";
import Button from "~/components/ui/Button";
import css from "./CommentCompose.css?inline";

interface CommentComposeProps {
    resourceType: string;
    resourceId: string;
    parentId?: string;
    editingComment?: CommentData;
    onSubmitted: () => void;
    onCancel?: () => void;
    isAdmin: boolean;
}

const MAX_LENGTH = 2000;

export default function CommentCompose(props: CommentComposeProps) {
    const [content, setContent] = createSignal(
        props.editingComment?.content ?? "",
    );
    const [submitting, setSubmitting] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);

    const count = () => content().length;
    const isOverLimit = () => count() > MAX_LENGTH;
    const isEmpty = () => content().trim().length === 0;

    async function handleSubmit() {
        if (isEmpty() || isOverLimit()) return;

        setSubmitting(true);
        setError(null);

        try {
            let res: Response;

            if (props.editingComment) {
                res = await fetch(`/api/comments/${props.editingComment.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: content() }),
                });
            } else {
                res = await fetch("/api/comments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        resourceType: props.resourceType,
                        resourceId: props.resourceId,
                        parentId: props.parentId,
                        content: content(),
                    }),
                });
            }

            if (!res.ok) {
                const text = await res.text();
                setError(text || "Failed to submit comment");
                return;
            }

            setContent("");
            props.onSubmitted();
        } catch {
            setError("Network error, please try again");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <style>{css}</style>
            <div class="comment-compose">
                <MarkdownEditor
                    value={content()}
                    onChange={setContent}
                    allowUpload={props.isAdmin}
                />
                <div class="comment-compose-footer">
                    <span
                        class={`comment-compose-counter${isOverLimit() ? " over-limit" : ""}`}
                    >
                        {count()} / {MAX_LENGTH}
                    </span>
                    <div class="comment-compose-actions">
                        <Show when={props.onCancel}>
                            <Button
                                color="neutral"
                                size="sm"
                                onClick={props.onCancel}
                                disabled={submitting()}
                            >
                                Cancel
                            </Button>
                        </Show>
                        <Button
                            color="primary"
                            type="submit"
                            onClick={handleSubmit}
                            disabled={
                                isEmpty() || isOverLimit() || submitting()
                            }
                        >
                            {submitting()
                                ? "Submitting..."
                                : props.editingComment
                                  ? "Save"
                                  : "Comment"}
                        </Button>
                    </div>
                </div>
                <Show when={error()}>
                    <p class="comment-compose-error">{error()}</p>
                </Show>
            </div>
        </>
    );
}
