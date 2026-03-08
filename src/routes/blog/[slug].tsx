import { Show, For } from "solid-js";
import { Title, Meta } from "@solidjs/meta";
import { query, createAsync, useParams } from "@solidjs/router";
import { marked } from "marked";
import Pill from "~/components/ui/Pill";
import "~/styles/page-narrow.css";
import "./blog.css";

const getBlogPost = query(async (slug: string) => {
    "use server";
    const { connection } = await import("~/database/connection");
    const { blogPost, user } = await import("~/database/schema");
    const { eq, and } = await import("drizzle-orm");

    const [post] = await connection
        .select({
            title: blogPost.title,
            slug: blogPost.slug,
            content: blogPost.content,
            excerpt: blogPost.excerpt,
            coverImage: blogPost.coverImage,
            tags: blogPost.tags,
            publishedAt: blogPost.publishedAt,
            authorName: user.name,
        })
        .from(blogPost)
        .innerJoin(user, eq(blogPost.authorId, user.id))
        .where(and(eq(blogPost.slug, slug), eq(blogPost.status, "published")))
        .limit(1);

    if (!post) return null;

    const { marked: markedFn } = await import("marked");
    const html = await markedFn(post.content ?? "");

    return { ...post, html };
}, "blog-post");

export default function BlogPost() {
    const params = useParams();
    const post = createAsync(() => getBlogPost(params.slug ?? ""));

    function formatDate(dateStr: string | null) {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    return (
        <main class="page-narrow">
            <Show
                when={post()}
                fallback={
                    <>
                        <Title>Post not found</Title>
                        <h1>Post not found</h1>
                        <p>The post you're looking for doesn't exist.</p>
                    </>
                }
            >
                {(p) => (
                    <>
                        <Title>{p().title}</Title>
                        <Meta name="description" content={p().excerpt ?? ""} />

                        <article>
                            <header class="blog-post-header">
                                <Show when={p().coverImage}>
                                    <img
                                        class="blog-post-cover"
                                        src={p().coverImage!}
                                        alt={p().title}
                                    />
                                </Show>
                                <h1 class="blog-post-title">{p().title}</h1>
                                <div class="blog-card-meta">
                                    <span>{p().authorName}</span>
                                    <span>
                                        {formatDate(
                                            p().publishedAt as string | null,
                                        )}
                                    </span>
                                </div>
                                <Show when={p().tags && p().tags!.length > 0}>
                                    <div class="blog-card-tags">
                                        <For each={p().tags!}>
                                            {(tag) => (
                                                <Pill color="primary">
                                                    {tag}
                                                </Pill>
                                            )}
                                        </For>
                                    </div>
                                </Show>
                            </header>
                            <div
                                class="blog-post-content"
                                innerHTML={p().html}
                            />
                        </article>
                    </>
                )}
            </Show>
        </main>
    );
}
