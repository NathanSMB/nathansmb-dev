import { Show, For } from "solid-js";
import { Title, Meta } from "@solidjs/meta";
import { query, createAsync, useParams, A } from "@solidjs/router";
import { TbOutlineArrowLeft } from "solid-icons/tb";
import { connection } from "~/database/connection";
import { blogPost, user } from "~/database/schema";
import { eq, and } from "drizzle-orm";
import { marked } from "marked";
import Pill from "~/components/ui/Pill";
import Avatar from "~/components/ui/Avatar";
import "./blog-post.css";

const getBlogPost = query(async (slug: string) => {
    "use server";

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
            authorImage: user.image,
        })
        .from(blogPost)
        .innerJoin(user, eq(blogPost.authorId, user.id))
        .where(and(eq(blogPost.slug, slug), eq(blogPost.status, "published")))
        .limit(1);

    if (!post) return null;

    const html = await marked(post.content ?? "");
    const readingTime = Math.max(
        1,
        Math.round((post.content ?? "").split(/\s+/).length / 230),
    );

    return { ...post, html, readingTime };
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
        <main class="blog-post-page">
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

                        <A href="/blog" class="blog-post-nav">
                            <TbOutlineArrowLeft />
                            Back to blog
                        </A>

                        <article>
                            <Show when={p().coverImage}>
                                <div class="blog-post-cover-wrap">
                                    <img
                                        class="blog-post-cover"
                                        src={p().coverImage!}
                                        alt={p().title}
                                    />
                                </div>
                            </Show>

                            <header class="blog-post-header">
                                <Show when={p().tags && p().tags!.length > 0}>
                                    <div class="blog-post-tags">
                                        <For each={p().tags!}>
                                            {(tag) => (
                                                <Pill color="primary">
                                                    {tag}
                                                </Pill>
                                            )}
                                        </For>
                                    </div>
                                </Show>

                                <h1 class="blog-post-title">{p().title}</h1>

                                <div class="blog-post-meta">
                                    <Avatar
                                        image={p().authorImage}
                                        name={p().authorName ?? ""}
                                    />
                                    <span>{p().authorName}</span>
                                    <span>&middot;</span>
                                    <span>
                                        {formatDate(
                                            p().publishedAt as string | null,
                                        )}
                                    </span>
                                    <span>&middot;</span>
                                    <span>{p().readingTime} min read</span>
                                </div>
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
