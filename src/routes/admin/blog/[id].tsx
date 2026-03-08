import { createSignal, onMount, Show } from "solid-js";
import { Title } from "@solidjs/meta";
import { useNavigate, useParams } from "@solidjs/router";
import BlogEditor from "~/components/blog/BlogEditor";
import Button from "~/components/ui/Button";
import TextInput from "~/components/ui/TextInput";
import TextArea from "~/components/ui/TextArea";
import Select from "~/components/ui/Select";
import FormLabel from "~/components/ui/FormLabel";
import Banner from "~/components/ui/Banner";
import Spinner from "~/components/ui/Spinner";
import "../admin.css";
import "./blog-admin.css";

const STATUS_OPTIONS = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
];

export default function AdminBlogEdit() {
    const params = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = createSignal("");
    const [slug, setSlug] = createSignal("");
    const [excerpt, setExcerpt] = createSignal("");
    const [coverImage, setCoverImage] = createSignal("");
    const [tags, setTags] = createSignal("");
    const [status, setStatus] = createSignal("draft");
    const [content, setContent] = createSignal("");
    const [loading, setLoading] = createSignal(true);
    const [saving, setSaving] = createSignal(false);
    const [error, setError] = createSignal("");
    const [success, setSuccess] = createSignal("");

    onMount(async () => {
        try {
            const res = await fetch(`/api/admin/blog/${params.id}`);
            if (!res.ok) throw new Error("Failed to load post");
            const post = await res.json();
            setTitle(post.title);
            setSlug(post.slug);
            setExcerpt(post.excerpt ?? "");
            setCoverImage(post.coverImage ?? "");
            setTags((post.tags ?? []).join(", "));
            setStatus(post.status);
            setContent(post.content ?? "");
        } catch (e: any) {
            setError(e.message ?? "Failed to load post");
        } finally {
            setLoading(false);
        }
    });

    async function handleSave() {
        if (!title() || !slug()) {
            setError("Title and slug are required");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`/api/admin/blog/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title(),
                    slug: slug(),
                    content: content(),
                    excerpt: excerpt(),
                    coverImage: coverImage(),
                    tags: tags()
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    status: status(),
                }),
            });
            if (!res.ok) throw new Error("Failed to update post");
            setSuccess("Post updated");
        } catch (e: any) {
            setError(e.message ?? "Failed to update post");
        } finally {
            setSaving(false);
        }
    }

    return (
        <main class="admin-page">
            <Title>Edit blog post</Title>
            <h1>Edit blog post</h1>

            <Banner variant="error" message={error()} />
            <Banner variant="success" message={success()} />

            <Show when={!loading()} fallback={<Spinner size="lg" />}>
                <div class="blog-form">
                    <div class="blog-form-row">
                        <FormLabel for="title">Title</FormLabel>
                        <TextInput
                            id="title"
                            size="lg"
                            color="surface"
                            value={title()}
                            onInput={setTitle}
                            placeholder="Post title"
                            required
                        />
                    </div>

                    <div class="blog-form-row">
                        <FormLabel for="slug">Slug</FormLabel>
                        <TextInput
                            id="slug"
                            size="lg"
                            color="surface"
                            value={slug()}
                            onInput={setSlug}
                            placeholder="post-slug"
                            required
                        />
                    </div>

                    <div class="blog-form-row">
                        <FormLabel for="excerpt">Excerpt</FormLabel>
                        <TextArea
                            id="excerpt"
                            size="lg"
                            color="surface"
                            value={excerpt()}
                            onInput={setExcerpt}
                            placeholder="Brief summary..."
                            rows={3}
                        />
                    </div>

                    <div class="blog-form-row-inline">
                        <div class="blog-form-row">
                            <FormLabel for="coverImage">
                                Cover Image URL
                            </FormLabel>
                            <TextInput
                                id="coverImage"
                                size="lg"
                                color="surface"
                                value={coverImage()}
                                onInput={setCoverImage}
                                placeholder="https://..."
                                type="url"
                            />
                        </div>
                        <div class="blog-form-row">
                            <FormLabel for="tags">Tags</FormLabel>
                            <TextInput
                                id="tags"
                                size="lg"
                                color="surface"
                                value={tags()}
                                onInput={setTags}
                                placeholder="tag1, tag2, tag3"
                            />
                        </div>
                        <div class="blog-form-row">
                            <FormLabel>Status</FormLabel>
                            <Select
                                value={status()}
                                options={STATUS_OPTIONS}
                                onChange={setStatus}
                                size="lg"
                            />
                        </div>
                    </div>

                    <div class="blog-form-row">
                        <FormLabel>Content</FormLabel>
                        <BlogEditor value={content()} onChange={setContent} />
                    </div>

                    <div class="blog-form-actions">
                        <Button
                            size="lg"
                            onClick={handleSave}
                            disabled={saving()}
                        >
                            {saving() ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                            color="neutral"
                            onClick={() => navigate("/admin/blog")}
                        >
                            Back to list
                        </Button>
                    </div>
                </div>
            </Show>
        </main>
    );
}
