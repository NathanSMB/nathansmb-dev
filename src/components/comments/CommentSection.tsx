import { createResource, Show, For } from "solid-js";
import { A } from "@solidjs/router";
import { authClient } from "~/auth/auth-client";
import type { CommentData } from "~/routes/api/comments";
import Comment from "./Comment";
import CommentCompose from "./CommentCompose";
import Spinner from "~/components/ui/Spinner";
import css from "./CommentSection.css?inline";

interface CommentSectionProps {
    resourceType: string;
    resourceId: string;
}

async function fetchComments(
    resourceType: string,
    resourceId: string,
): Promise<CommentData[]> {
    const res = await fetch(
        `/api/comments?resourceType=${encodeURIComponent(resourceType)}&resourceId=${encodeURIComponent(resourceId)}`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.comments as CommentData[];
}

export default function CommentSection(props: CommentSectionProps) {
    const session = authClient.useSession();

    const [comments, { refetch }] = createResource(
        () => [props.resourceType, props.resourceId] as const,
        ([rt, rid]) => fetchComments(rt, rid),
    );

    function handleRefetch() {
        refetch();
    }

    const currentUser = () => session().data?.user;
    const isAdmin = () => currentUser()?.role === "admin";
    const count = () => {
        const list = comments() ?? [];
        return list.reduce((acc, c) => acc + 1 + c.replies.length, 0);
    };

    return (
        <>
            <style>{css}</style>
            <section class="comment-section">
                <h2 class="comment-section-heading">
                    {count()} {count() === 1 ? "Comment" : "Comments"}
                </h2>

                <Show
                    when={currentUser()}
                    fallback={
                        <p class="comment-section-login">
                            <A href="/login">Log in</A> to leave a comment.
                        </p>
                    }
                >
                    <div class="comment-section-compose">
                        <CommentCompose
                            resourceType={props.resourceType}
                            resourceId={props.resourceId}
                            onSubmitted={handleRefetch}
                            isAdmin={isAdmin()}
                        />
                    </div>
                </Show>

                <Show when={comments.loading}>
                    <Spinner size="md" center />
                </Show>

                <Show when={!comments.loading && (comments() ?? []).length > 0}>
                    <div class="comment-section-list">
                        <For each={comments()}>
                            {(c) => (
                                <Comment
                                    comment={c}
                                    currentUserId={currentUser()?.id}
                                    currentUserRole={
                                        currentUser()?.role ?? null
                                    }
                                    isAdmin={isAdmin()}
                                    resourceType={props.resourceType}
                                    resourceId={props.resourceId}
                                    onRefetch={handleRefetch}
                                />
                            )}
                        </For>
                    </div>
                </Show>

                <Show
                    when={!comments.loading && (comments() ?? []).length === 0}
                >
                    <p class="comment-section-empty">
                        No comments yet. Be the first!
                    </p>
                </Show>
            </section>
        </>
    );
}
