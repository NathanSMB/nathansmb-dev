import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import css from "./BlogEditor.css?inline";

interface MarkdownStorage {
    getMarkdown: () => string;
}

interface BlogEditorProps {
    value: string;
    onChange: (markdown: string) => void;
}

export default function BlogEditor(props: BlogEditorProps) {
    const [mode, setMode] = createSignal<"rich" | "markdown">("rich");
    const [editor, setEditor] = createSignal<Editor | null>(null);
    let editorRef!: HTMLDivElement;

    function getMarkdown(e: Editor): string {
        const storage = e.storage as unknown as Record<string, MarkdownStorage>;
        return storage.markdown.getMarkdown();
    }

    onMount(() => {
        const e = new Editor({
            element: editorRef,
            extensions: [
                StarterKit,
                Markdown.configure({ html: false, transformPastedText: true }),
            ],
            content: props.value,
            onUpdate: ({ editor: inst }) => {
                props.onChange(getMarkdown(inst));
            },
        });
        setEditor(e);
    });

    onCleanup(() => {
        editor()?.destroy();
    });

    function switchMode(newMode: "rich" | "markdown") {
        if (newMode === mode()) return;
        const e = editor();

        if (newMode === "markdown" && e) {
            props.onChange(getMarkdown(e));
        } else if (newMode === "rich" && e) {
            e.commands.setContent(props.value);
        }

        setMode(newMode);
    }

    return (
        <>
            <style>{css}</style>
            <div class="blog-editor">
                <div class="blog-editor-tabs">
                    <button
                        type="button"
                        class={`blog-editor-tab${mode() === "rich" ? " active" : ""}`}
                        onClick={() => switchMode("rich")}
                    >
                        Rich Editor
                    </button>
                    <button
                        type="button"
                        class={`blog-editor-tab${mode() === "markdown" ? " active" : ""}`}
                        onClick={() => switchMode("markdown")}
                    >
                        Markdown
                    </button>
                </div>

                <Show when={mode() === "rich"}>
                    <div class="blog-editor-toolbar">
                        <button
                            type="button"
                            class={editor()?.isActive("bold") ? "active" : ""}
                            onClick={() =>
                                editor()?.chain().focus().toggleBold().run()
                            }
                            title="Bold"
                        >
                            B
                        </button>
                        <button
                            type="button"
                            class={editor()?.isActive("italic") ? "active" : ""}
                            onClick={() =>
                                editor()?.chain().focus().toggleItalic().run()
                            }
                            title="Italic"
                        >
                            <em>I</em>
                        </button>
                        <button
                            type="button"
                            class={
                                editor()?.isActive("heading", { level: 2 })
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                editor()
                                    ?.chain()
                                    .focus()
                                    .toggleHeading({ level: 2 })
                                    .run()
                            }
                            title="Heading 2"
                        >
                            H2
                        </button>
                        <button
                            type="button"
                            class={
                                editor()?.isActive("heading", { level: 3 })
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                editor()
                                    ?.chain()
                                    .focus()
                                    .toggleHeading({ level: 3 })
                                    .run()
                            }
                            title="Heading 3"
                        >
                            H3
                        </button>
                        <button
                            type="button"
                            class={
                                editor()?.isActive("bulletList") ? "active" : ""
                            }
                            onClick={() =>
                                editor()
                                    ?.chain()
                                    .focus()
                                    .toggleBulletList()
                                    .run()
                            }
                            title="Bullet List"
                        >
                            &#8226;
                        </button>
                        <button
                            type="button"
                            class={
                                editor()?.isActive("orderedList")
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                editor()
                                    ?.chain()
                                    .focus()
                                    .toggleOrderedList()
                                    .run()
                            }
                            title="Ordered List"
                        >
                            1.
                        </button>
                        <button
                            type="button"
                            class={editor()?.isActive("code") ? "active" : ""}
                            onClick={() =>
                                editor()?.chain().focus().toggleCode().run()
                            }
                            title="Inline Code"
                        >
                            {"</>"}
                        </button>
                        <button
                            type="button"
                            class={
                                editor()?.isActive("codeBlock") ? "active" : ""
                            }
                            onClick={() =>
                                editor()
                                    ?.chain()
                                    .focus()
                                    .toggleCodeBlock()
                                    .run()
                            }
                            title="Code Block"
                        >
                            {"{ }"}
                        </button>
                        <button
                            type="button"
                            class={
                                editor()?.isActive("blockquote") ? "active" : ""
                            }
                            onClick={() =>
                                editor()
                                    ?.chain()
                                    .focus()
                                    .toggleBlockquote()
                                    .run()
                            }
                            title="Blockquote"
                        >
                            &#8220;
                        </button>
                    </div>
                </Show>

                <div
                    ref={editorRef}
                    class="blog-editor-content"
                    style={mode() === "markdown" ? "display:none" : ""}
                />

                <Show when={mode() === "markdown"}>
                    <textarea
                        class="blog-editor-markdown"
                        value={props.value}
                        onInput={(e) => props.onChange(e.currentTarget.value)}
                    />
                </Show>
            </div>
        </>
    );
}
