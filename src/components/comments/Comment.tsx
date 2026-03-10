import { createSignal, Show, For } from "solid-js";
import type { CommentData } from "~/routes/api/comments";
import Avatar from "~/components/ui/Avatar";
import Button from "~/components/ui/Button";
import Pill from "~/components/ui/Pill";
import ConfirmModal from "~/components/ui/ConfirmModal";
import CommentCompose from "./CommentCompose";
import css from "./Comment.css?inline";

interface CommentProps {
    comment: CommentData;
    currentUserId?: string;
    currentUserRole?: string | null;
    isAdmin: boolean;
    resourceType: string;
    resourceId: string;
    onRefetch: () => void;
    isReply?: boolean;
}

function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years === 1 ? "" : "s"} ago`;
}

function wasEdited(c: CommentData): boolean {
    return (
        new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime() > 1000
    );
}

export default function Comment(props: CommentProps) {
    const [showReply, setShowReply] = createSignal(false);
    const [showEdit, setShowEdit] = createSignal(false);
    const [showDeleteModal, setShowDeleteModal] = createSignal(false);
    const [deleting, setDeleting] = createSignal(false);

    const isOwn = () => props.currentUserId === props.comment.authorId;
    const canDelete = () => isOwn() || props.isAdmin;

    async function handleDelete() {
        setDeleting(true);
        try {
            const res = await fetch(`/api/comments/${props.comment.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setShowDeleteModal(false);
                props.onRefetch();
            }
        } finally {
            setDeleting(false);
        }
    }

    function onEditSubmitted() {
        setShowEdit(false);
        props.onRefetch();
    }

    function onReplySubmitted() {
        setShowReply(false);
        props.onRefetch();
    }

    return (
        <>
            <style>{css}</style>
            <div class={`comment${props.isReply ? " comment-reply" : ""}`}>
                <div class="comment-avatar">
                    <Avatar
                        image={props.comment.authorImage}
                        name={props.comment.authorName}
                    />
                </div>
                <div class="comment-body">
                    <div class="comment-header">
                        <span class="comment-author">
                            {props.comment.authorName}
                        </span>
                        <Show when={props.comment.authorRole === "admin"}>
                            <Pill color="primary">Admin</Pill>
                        </Show>
                        <span class="comment-time">
                            {relativeTime(props.comment.createdAt)}
                        </span>
                        <Show when={wasEdited(props.comment)}>
                            <span class="comment-edited">(edited)</span>
                        </Show>
                    </div>

                    <Show
                        when={!showEdit()}
                        fallback={
                            <CommentCompose
                                resourceType={props.resourceType}
                                resourceId={props.resourceId}
                                editingComment={props.comment}
                                onSubmitted={onEditSubmitted}
                                onCancel={() => setShowEdit(false)}
                                isAdmin={props.isAdmin}
                            />
                        }
                    >
                        <div
                            class="comment-content"
                            innerHTML={props.comment.contentHtml}
                        />
                    </Show>

                    <div class="comment-actions">
                        <Show when={!props.isReply && props.currentUserId}>
                            <button
                                class="comment-action-btn"
                                onClick={() => setShowReply(!showReply())}
                            >
                                {showReply() ? "Cancel" : "Reply"}
                            </button>
                        </Show>
                        <Show when={isOwn()}>
                            <button
                                class="comment-action-btn"
                                onClick={() => setShowEdit(!showEdit())}
                            >
                                Edit
                            </button>
                        </Show>
                        <Show when={canDelete()}>
                            <button
                                class="comment-action-btn comment-action-danger"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                Delete
                            </button>
                        </Show>
                    </div>

                    <Show when={showReply()}>
                        <div class="comment-reply-compose">
                            <CommentCompose
                                resourceType={props.resourceType}
                                resourceId={props.resourceId}
                                parentId={props.comment.id}
                                onSubmitted={onReplySubmitted}
                                onCancel={() => setShowReply(false)}
                                isAdmin={props.isAdmin}
                            />
                        </div>
                    </Show>

                    <Show
                        when={
                            props.comment.replies.length > 0 && !props.isReply
                        }
                    >
                        <div class="comment-replies">
                            <For each={props.comment.replies}>
                                {(reply) => (
                                    <Comment
                                        comment={reply}
                                        currentUserId={props.currentUserId}
                                        currentUserRole={props.currentUserRole}
                                        isAdmin={props.isAdmin}
                                        resourceType={props.resourceType}
                                        resourceId={props.resourceId}
                                        onRefetch={props.onRefetch}
                                        isReply
                                    />
                                )}
                            </For>
                        </div>
                    </Show>
                </div>
            </div>

            <ConfirmModal
                open={showDeleteModal()}
                title="Delete comment"
                message="Are you sure you want to delete this comment? This cannot be undone."
                variant="danger"
                confirmLabel="Delete"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
                loading={deleting()}
            />
        </>
    );
}
