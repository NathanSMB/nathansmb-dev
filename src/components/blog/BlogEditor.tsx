import {
    createSignal,
    createMemo,
    onMount,
    onCleanup,
    Show,
    For,
} from "solid-js";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Placeholder from "@tiptap/extension-placeholder";
import {
    TbOutlineBold,
    TbOutlineItalic,
    TbOutlineStrikethrough,
    TbOutlineH1,
    TbOutlineH2,
    TbOutlineH3,
    TbOutlineList,
    TbOutlineListNumbers,
    TbOutlineCode,
    TbOutlineFileCode,
    TbOutlineBlockquote,
    TbOutlineLineDashed,
    TbOutlineArrowBackUp,
    TbOutlineArrowForwardUp,
} from "solid-icons/tb";
import css from "./BlogEditor.css?inline";

interface MarkdownStorage {
    getMarkdown: () => string;
}

interface BlogEditorProps {
    value: string;
    onChange: (markdown: string) => void;
}

interface ToolbarButton {
    icon: () => import("solid-js").JSX.Element;
    title: string;
    action: (e: Editor) => void;
    isActive?: (e: Editor) => boolean;
}

type ToolbarGroup = ToolbarButton[];

export default function BlogEditor(props: BlogEditorProps) {
    const [mode, setMode] = createSignal<"rich" | "markdown">("rich");
    const [editor, setEditor] = createSignal<Editor | null>(null);
    const [tick, setTick] = createSignal(0);
    let editorRef!: HTMLDivElement;

    function getMarkdown(e: Editor): string {
        const storage = e.storage as unknown as Record<string, MarkdownStorage>;
        return storage.markdown.getMarkdown();
    }

    const toolbarGroups: ToolbarGroup[] = [
        [
            {
                icon: () => <TbOutlineBold />,
                title: "Bold (Ctrl+B)",
                action: (e) => e.chain().focus().toggleBold().run(),
                isActive: (e) => e.isActive("bold"),
            },
            {
                icon: () => <TbOutlineItalic />,
                title: "Italic (Ctrl+I)",
                action: (e) => e.chain().focus().toggleItalic().run(),
                isActive: (e) => e.isActive("italic"),
            },
            {
                icon: () => <TbOutlineStrikethrough />,
                title: "Strikethrough (Ctrl+Shift+X)",
                action: (e) => e.chain().focus().toggleStrike().run(),
                isActive: (e) => e.isActive("strike"),
            },
        ],
        [
            {
                icon: () => <TbOutlineH1 />,
                title: "Heading 1 (Ctrl+Alt+1)",
                action: (e) =>
                    e.chain().focus().toggleHeading({ level: 1 }).run(),
                isActive: (e) => e.isActive("heading", { level: 1 }),
            },
            {
                icon: () => <TbOutlineH2 />,
                title: "Heading 2 (Ctrl+Alt+2)",
                action: (e) =>
                    e.chain().focus().toggleHeading({ level: 2 }).run(),
                isActive: (e) => e.isActive("heading", { level: 2 }),
            },
            {
                icon: () => <TbOutlineH3 />,
                title: "Heading 3 (Ctrl+Alt+3)",
                action: (e) =>
                    e.chain().focus().toggleHeading({ level: 3 }).run(),
                isActive: (e) => e.isActive("heading", { level: 3 }),
            },
        ],
        [
            {
                icon: () => <TbOutlineList />,
                title: "Bullet List (Ctrl+Shift+8)",
                action: (e) => e.chain().focus().toggleBulletList().run(),
                isActive: (e) => e.isActive("bulletList"),
            },
            {
                icon: () => <TbOutlineListNumbers />,
                title: "Ordered List (Ctrl+Shift+7)",
                action: (e) => e.chain().focus().toggleOrderedList().run(),
                isActive: (e) => e.isActive("orderedList"),
            },
        ],
        [
            {
                icon: () => <TbOutlineCode />,
                title: "Inline Code (Ctrl+E)",
                action: (e) => e.chain().focus().toggleCode().run(),
                isActive: (e) => e.isActive("code"),
            },
            {
                icon: () => <TbOutlineFileCode />,
                title: "Code Block (Ctrl+Alt+C)",
                action: (e) => e.chain().focus().toggleCodeBlock().run(),
                isActive: (e) => e.isActive("codeBlock"),
            },
            {
                icon: () => <TbOutlineBlockquote />,
                title: "Blockquote (Ctrl+Shift+B)",
                action: (e) => e.chain().focus().toggleBlockquote().run(),
                isActive: (e) => e.isActive("blockquote"),
            },
        ],
        [
            {
                icon: () => <TbOutlineLineDashed />,
                title: "Horizontal Rule",
                action: (e) => e.chain().focus().setHorizontalRule().run(),
            },
        ],
    ];

    onMount(() => {
        const e = new Editor({
            element: editorRef,
            extensions: [
                StarterKit,
                Markdown.configure({ html: false, transformPastedText: true }),
                Placeholder.configure({ placeholder: "Start writing..." }),
            ],
            content: props.value,
            onUpdate: ({ editor: inst }) => {
                props.onChange(getMarkdown(inst));
                setTick((t) => t + 1);
            },
            onSelectionUpdate: () => {
                setTick((t) => t + 1);
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

    const wordCount = createMemo(() => {
        tick();
        const text =
            mode() === "rich"
                ? (() => {
                      const e = editor();
                      return e ? getMarkdown(e) : "";
                  })()
                : props.value;
        const words = text.trim().split(/\s+/).filter(Boolean);
        return words.length;
    });

    return (
        <>
            <style>{css}</style>
            <div class="blog-editor">
                <div class="blog-editor-toolbar">
                    <div class="toolbar-group">
                        <button
                            type="button"
                            class="toolbar-btn"
                            title="Undo (Ctrl+Z)"
                            onClick={() => {
                                const inst = editor();
                                if (inst) inst.chain().focus().undo().run();
                            }}
                            disabled={!editor()}
                        >
                            <TbOutlineArrowBackUp />
                        </button>
                        <button
                            type="button"
                            class="toolbar-btn"
                            title="Redo (Ctrl+Shift+Z)"
                            onClick={() => {
                                const inst = editor();
                                if (inst) inst.chain().focus().redo().run();
                            }}
                            disabled={!editor()}
                        >
                            <TbOutlineArrowForwardUp />
                        </button>
                    </div>
                    <Show when={mode() === "rich"}>
                        <div class="toolbar-sep" />
                        <For each={toolbarGroups}>
                            {(group, gi) => (
                                <>
                                    <Show when={gi() > 0}>
                                        <div class="toolbar-sep" />
                                    </Show>
                                    <div class="toolbar-group">
                                        <For each={group}>
                                            {(btn) => {
                                                const active = () => {
                                                    tick();
                                                    const inst = editor();
                                                    return inst && btn.isActive
                                                        ? btn.isActive(inst)
                                                        : false;
                                                };
                                                return (
                                                    <button
                                                        type="button"
                                                        class={`toolbar-btn${active() ? " active" : ""}`}
                                                        title={btn.title}
                                                        onClick={() => {
                                                            const inst =
                                                                editor();
                                                            if (inst)
                                                                btn.action(
                                                                    inst,
                                                                );
                                                        }}
                                                        disabled={!editor()}
                                                    >
                                                        {btn.icon()}
                                                    </button>
                                                );
                                            }}
                                        </For>
                                    </div>
                                </>
                            )}
                        </For>
                    </Show>
                    <div class="toolbar-spacer" />
                    <div class="toolbar-mode-toggle">
                        <button
                            type="button"
                            class={mode() === "rich" ? "active" : ""}
                            onClick={() => switchMode("rich")}
                        >
                            Rich
                        </button>
                        <button
                            type="button"
                            class={mode() === "markdown" ? "active" : ""}
                            onClick={() => switchMode("markdown")}
                        >
                            Markdown
                        </button>
                    </div>
                </div>

                <div
                    ref={editorRef}
                    class="blog-editor-content"
                    style={mode() === "markdown" ? "display:none" : ""}
                />

                <Show when={mode() === "markdown"}>
                    <div class="blog-editor-markdown-wrap">
                        <textarea
                            class="blog-editor-markdown"
                            placeholder="Start writing..."
                            value={props.value}
                            ref={(el) => {
                                requestAnimationFrame(() => {
                                    el.style.height = "auto";
                                    el.style.height = `${el.scrollHeight}px`;
                                });
                            }}
                            onInput={(e) => {
                                const ta = e.currentTarget;
                                ta.style.height = "auto";
                                ta.style.height = `${ta.scrollHeight}px`;
                                props.onChange(ta.value);
                            }}
                        />
                    </div>
                </Show>

                <div class="blog-editor-footer">
                    <span>{wordCount()} words</span>
                </div>
            </div>
        </>
    );
}
