import { Show, For, createSignal } from "solid-js";
import { Title, Meta } from "@solidjs/meta";
import { query, createAsync, useSearchParams, A } from "@solidjs/router";
import { connection } from "~/database/connection";
import { blogPost, user } from "~/database/schema";
import { desc, eq, count, ilike, or, sql, and } from "drizzle-orm";
import { readingTime } from "~/utils/reading-time";
import Pill from "~/components/ui/Pill";
import Avatar from "~/components/ui/Avatar";
import Form from "~/components/ui/Form";
import TextInput from "~/components/ui/TextInput";
import Button from "~/components/ui/Button";
import Pagination from "~/components/ui/Pagination";
import "./blog.css";

const getPublishedPosts = query(
    async (page: number, pageSize: number, search: string) => {
        "use server";

        const offset = page * pageSize;

        const conditions = search
            ? and(
                  eq(blogPost.status, "published"),
                  or(
                      ilike(blogPost.title, `%${search}%`),
                      ilike(blogPost.excerpt, `%${search}%`),
                      sql`EXISTS (SELECT 1 FROM unnest(${blogPost.tags}) AS t WHERE t ILIKE ${"%" + search + "%"})`,
                  ),
              )
            : eq(blogPost.status, "published");

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
                .where(conditions)
                .orderBy(desc(blogPost.publishedAt))
                .limit(pageSize)
                .offset(offset),
            connection
                .select({ total: count() })
                .from(blogPost)
                .where(conditions),
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
    },
    "published-posts",
);

export default function BlogListing() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = () => {
        const p = searchParams.page;
        return Math.max(0, parseInt(typeof p === "string" ? p : "0"));
    };
    const pageSize = () => {
        const s = searchParams.pageSize;
        return parseInt(typeof s === "string" ? s : "10") || 10;
    };
    const search = () => {
        const s = searchParams.search;
        return typeof s === "string" ? s : "";
    };

    const [searchInput, setSearchInput] = createSignal(search());

    const data = createAsync(() =>
        getPublishedPosts(page(), pageSize(), search()),
    );

    const totalPages = () => {
        const d = data();
        if (!d) return 1;
        return Math.max(1, Math.ceil(d.total / pageSize()));
    };

    function formatDate(dateStr: string | null) {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    function handleSearch() {
        setSearchParams({ page: "0", search: searchInput() || undefined });
    }

    return (
        <main class="blog-index">
            <Title>Blog</Title>
            <Meta name="description" content="Blog posts and articles" />
            <h1 class="blog-index-heading">Blog</h1>

            <Form
                variant="inline"
                class="blog-search-form"
                onSubmit={handleSearch}
            >
                <TextInput
                    size="md"
                    value={searchInput()}
                    onInput={setSearchInput}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                    }}
                    placeholder="Search posts…"
                />
                <Button type="submit" size="md">
                    Search
                </Button>
            </Form>

            <Show
                when={data()?.posts.length}
                fallback={
                    <p class="blog-empty">
                        {search() ? "No posts found." : "No posts yet."}
                    </p>
                }
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
            </Show>

            <Pagination
                page={page()}
                totalPages={totalPages()}
                hasPrevious={page() > 0}
                hasNext={page() + 1 < totalPages()}
                pageSize={pageSize()}
                onFirst={() => setSearchParams({ page: "0" })}
                onPrevious={() =>
                    setSearchParams({
                        page: String(page() - 1),
                    })
                }
                onNext={() =>
                    setSearchParams({
                        page: String(page() + 1),
                    })
                }
                onLast={() =>
                    setSearchParams({
                        page: String(totalPages() - 1),
                    })
                }
                onPageSizeChange={(size) =>
                    setSearchParams({
                        page: "0",
                        pageSize: String(size),
                    })
                }
            />
        </main>
    );
}
