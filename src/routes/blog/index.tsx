import { Show, For } from "solid-js";
import { Title, Meta } from "@solidjs/meta";
import { query, createAsync, useSearchParams, A } from "@solidjs/router";
import { connection } from "~/database/connection";
import { blogPost, user } from "~/database/schema";
import { desc, eq, count } from "drizzle-orm";
import { readingTime } from "~/utils/reading-time";
import Pill from "~/components/ui/Pill";
import Avatar from "~/components/ui/Avatar";
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
                content: blogPost.content,
                coverImage: blogPost.coverImage,
                tags: blogPost.tags,
                publishedAt: blogPost.publishedAt,
                authorName: user.name,
                authorImage: user.image,
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

    return {
        posts: posts.map((p) => ({
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            coverImage: p.coverImage,
            tags: p.tags,
            publishedAt: p.publishedAt,
            authorName: p.authorName,
            authorImage: p.authorImage,
            readingTime: readingTime(p.content ?? ""),
        })),
        total,
    };
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
        <main class="blog-index">
            <Title>Blog</Title>
            <Meta name="description" content="Blog posts and articles" />
            <h1 class="blog-index-heading">Blog</h1>

            <Show
                when={data()?.posts.length}
                fallback={<p class="blog-empty">No posts yet.</p>}
            >
                <div class="blog-list">
                    <For each={data()!.posts}>
                        {(post) => (
                            <A
                                href={`/blog/${post.slug}`}
                                class="blog-card-link"
                            >
                                <article class="blog-card">
                                    <Show when={post.coverImage}>
                                        <img
                                            class="blog-card-cover"
                                            src={post.coverImage!}
                                            alt={post.title}
                                        />
                                    </Show>
                                    <div class="blog-card-overlay">
                                        <h2 class="blog-card-title">
                                            {post.title}
                                        </h2>
                                        <Show when={post.excerpt}>
                                            <p class="blog-card-excerpt">
                                                {post.excerpt}
                                            </p>
                                        </Show>
                                        <div class="blog-card-meta">
                                            <Avatar
                                                image={post.authorImage}
                                                name={post.authorName ?? ""}
                                            />
                                            <span class="blog-card-author">
                                                {post.authorName}
                                            </span>
                                            <span class="blog-card-sep">
                                                &middot;
                                            </span>
                                            <span>
                                                {formatDate(
                                                    post.publishedAt as
                                                        | string
                                                        | null,
                                                )}
                                            </span>
                                            <span class="blog-card-sep">
                                                &middot;
                                            </span>
                                            <span>
                                                {post.readingTime} min read
                                            </span>
                                        </div>
                                        <Show
                                            when={
                                                post.tags &&
                                                post.tags.length > 0
                                            }
                                        >
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
                                    </div>
                                </article>
                            </A>
                        )}
                    </For>
                </div>

                <Show when={totalPages() > 1}>
                    <div class="blog-pagination">
                        <Show when={page() > 0}>
                            <A
                                href={`/blog?page=${page() - 1}`}
                                class="blog-pagination-btn"
                            >
                                Previous
                            </A>
                        </Show>
                        <span class="blog-pagination-info">
                            Page {page() + 1} of {totalPages()}
                        </span>
                        <Show when={page() + 1 < totalPages()}>
                            <A
                                href={`/blog?page=${page() + 1}`}
                                class="blog-pagination-btn"
                            >
                                Next
                            </A>
                        </Show>
                    </div>
                </Show>
            </Show>
        </main>
    );
}
