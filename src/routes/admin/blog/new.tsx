import { createSignal } from "solid-js";
import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import BlogEditor from "~/components/blog/BlogEditor";
import Button from "~/components/ui/Button";
import TextInput from "~/components/ui/TextInput";
import Select from "~/components/ui/Select";
import FormLabel from "~/components/ui/FormLabel";
import Banner from "~/components/ui/Banner";
import "../admin.css";
import "./blog-admin.css";

const STATUS_OPTIONS = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
];

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function AdminBlogNew() {
    const navigate = useNavigate();
    const [title, setTitle] = createSignal("");
    const [slug, setSlug] = createSignal("");
    const [slugTouched, setSlugTouched] = createSignal(false);
    const [excerpt, setExcerpt] = createSignal("");
    const [coverImage, setCoverImage] = createSignal("");
    const [tags, setTags] = createSignal("");
    const [status, setStatus] = createSignal("draft");
    const [content, setContent] = createSignal("");
    const [saving, setSaving] = createSignal(false);
    const [error, setError] = createSignal("");

    function handleTitleInput(value: string) {
        setTitle(value);
        if (!slugTouched()) setSlug(slugify(value));
    }

    async function handleSave() {
        if (!title() || !slug()) {
            setError("Title and slug are required");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const res = await fetch("/api/admin/blog", {
                method: "POST",
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
            if (!res.ok) throw new Error("Failed to create post");
            navigate("/admin/blog");
        } catch (e: any) {
            setError(e.message ?? "Failed to create post");
        } finally {
            setSaving(false);
        }
    }

    return (
        <main class="admin-page">
            <Title>New blog post</Title>
            <h1>New blog post</h1>

            <Banner variant="error" message={error()} />

            <div class="blog-form">
                <div class="blog-form-row">
                    <FormLabel for="title">Title</FormLabel>
                    <TextInput
                        id="title"
                        variant="form"
                        value={title()}
                        onInput={handleTitleInput}
                        placeholder="Post title"
                        required
                    />
                </div>

                <div class="blog-form-row">
                    <FormLabel for="slug">Slug</FormLabel>
                    <TextInput
                        id="slug"
                        variant="form"
                        value={slug()}
                        onInput={(v) => {
                            setSlugTouched(true);
                            setSlug(v);
                        }}
                        placeholder="post-slug"
                        required
                    />
                </div>

                <div class="blog-form-row">
                    <FormLabel for="excerpt">Excerpt</FormLabel>
                    <textarea
                        id="excerpt"
                        value={excerpt()}
                        onInput={(e) => setExcerpt(e.currentTarget.value)}
                        placeholder="Brief summary..."
                        rows={3}
                    />
                </div>

                <div class="blog-form-row-inline">
                    <div class="blog-form-row">
                        <FormLabel for="coverImage">Cover Image URL</FormLabel>
                        <TextInput
                            id="coverImage"
                            variant="form"
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
                            variant="form"
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
                        />
                    </div>
                </div>

                <div class="blog-form-row">
                    <FormLabel>Content</FormLabel>
                    <BlogEditor value={content()} onChange={setContent} />
                </div>

                <div class="blog-form-actions">
                    <Button
                        variant="form"
                        onClick={handleSave}
                        disabled={saving()}
                    >
                        {saving() ? "Saving..." : "Create Post"}
                    </Button>
                    <Button
                        color="neutral"
                        onClick={() => navigate("/admin/blog")}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </main>
    );
}
