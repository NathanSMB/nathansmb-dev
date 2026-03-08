import { Show, For } from "solid-js";
import { Title, Meta } from "@solidjs/meta";
import { query, createAsync, useSearchParams, A } from "@solidjs/router";
import { connection } from "~/database/connection";
import { blogPost, user } from "~/database/schema";
import { desc, eq, count } from "drizzle-orm";
import Pill from "~/components/ui/Pill";
import "~/styles/page-narrow.css";
import "./blog.css";

const PAGE_SIZE = 10;

const getPublishedPosts = query(async (page: number) => {
    "use server";

    const offset = page * PAGE_SIZE;

    const [posts, [{ total }]] = await Promise.all([
        connection
            .select({
                title: blogPost.title,
                slug: blogPost.slug,
                excerpt: blogPost.excerpt,
                coverImage: blogPost.coverImage,
                tags: blogPost.tags,
                publishedAt: blogPost.publishedAt,
                authorName: user.name,
            })
            .from(blogPost)
            .innerJoin(user, eq(blogPost.authorId, user.id))
            .where(eq(blogPost.status, "published"))
            .orderBy(desc(blogPost.publishedAt))
            .limit(PAGE_SIZE)
            .offset(offset),
        connection
            .select({ total: count() })
            .from(blogPost)
            .where(eq(blogPost.status, "published")),
    ]);

    return { posts, total };
}, "published-posts");

export default function BlogListing() {
    const [searchParams] = useSearchParams();
    const page = () => {
        const p = searchParams.page;
        return Math.max(0, parseInt(typeof p === "string" ? p : "0"));
    };
    const data = createAsync(() => getPublishedPosts(page()));

    const totalPages = () => {
        const d = data();
        if (!d) return 1;
        return Math.max(1, Math.ceil(d.total / PAGE_SIZE));
    };

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
            <Title>Blog</Title>
            <Meta name="description" content="Blog posts and articles" />
            <h1>Blog</h1>

            <Show
                when={data()?.posts.length}
                fallback={<p class="blog-empty">No posts yet.</p>}
            >
                <div class="blog-list">
                    <For each={data()!.posts}>
                        {(post) => (
                            <article class="blog-card">
                                <Show when={post.coverImage}>
                                    <img
                                        class="blog-card-cover"
                                        src={post.coverImage!}
                                        alt={post.title}
                                    />
                                </Show>
                                <h2 class="blog-card-title">
                                    <A href={`/blog/${post.slug}`}>
                                        {post.title}
                                    </A>
                                </h2>
                                <div class="blog-card-meta">
                                    <span>{post.authorName}</span>
                                    <span>
                                        {formatDate(
                                            post.publishedAt as string | null,
                                        )}
                                    </span>
                                </div>
                                <Show when={post.excerpt}>
                                    <p class="blog-card-excerpt">
                                        {post.excerpt}
                                    </p>
                                </Show>
                                <Show when={post.tags && post.tags.length > 0}>
                                    <div class="blog-card-tags">
                                        <For each={post.tags!}>
                                            {(tag) => (
                                                <Pill color="primary">
                                                    {tag}
                                                </Pill>
                                            )}
                                        </For>
                                    </div>
                                </Show>
                            </article>
                        )}
                    </For>
                </div>

                <Show when={totalPages() > 1}>
                    <div class="blog-pagination">
                        <Show when={page() > 0}>
                            <A href={`/blog?page=${page() - 1}`}>Previous</A>
                        </Show>
                        <span>
                            Page {page() + 1} of {totalPages()}
                        </span>
                        <Show when={page() + 1 < totalPages()}>
                            <A href={`/blog?page=${page() + 1}`}>Next</A>
                        </Show>
                    </div>
                </Show>
            </Show>
        </main>
    );
}
