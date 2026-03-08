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
import Image from "@tiptap/extension-image";
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
    TbOutlineLink,
    TbOutlineLinkOff,
    TbOutlinePhoto,
    TbOutlineArrowBackUp,
    TbOutlineArrowForwardUp,
    TbOutlineArrowsMaximize,
    TbOutlineArrowsMinimize,
} from "solid-icons/tb";
import FormModal from "~/components/ui/FormModal";
import TextInput from "~/components/ui/TextInput";
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
    const [fullscreen, setFullscreen] = createSignal(false);
    const [editor, setEditor] = createSignal<Editor | null>(null);
    const [tick, setTick] = createSignal(0);
    const [history, setHistory] = createSignal<string[]>([props.value]);
    const [historyIdx, setHistoryIdx] = createSignal(0);
    const [linkModalOpen, setLinkModalOpen] = createSignal(false);
    const [linkUrl, setLinkUrl] = createSignal("");
    const [imageModalOpen, setImageModalOpen] = createSignal(false);
    const [imageUrl, setImageUrl] = createSignal("");
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    let isRestoring = false;
    let editorRef!: HTMLDivElement;

    function getMarkdown(e: Editor): string {
        const storage = e.storage as unknown as Record<string, MarkdownStorage>;
        return storage.markdown.getMarkdown();
    }

    function handleChange(newValue: string) {
        props.onChange(newValue);
        if (isRestoring) return;

        const idx = historyIdx();
        const hist = history().slice(0, idx + 1);

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (newValue !== hist[hist.length - 1]) {
                setHistory([...hist, newValue]);
                setHistoryIdx(hist.length);
            }
        }, 500);
    }

    function restore(value: string) {
        isRestoring = true;
        props.onChange(value);
        const e = editor();
        if (mode() === "rich" && e) {
            e.commands.setContent(value);
        }
        isRestoring = false;
    }

    function flushDebounce() {
        if (debounceTimer !== undefined) {
            clearTimeout(debounceTimer);
            debounceTimer = undefined;
            const current = props.value;
            const idx = historyIdx();
            const hist = history().slice(0, idx + 1);
            if (current !== hist[hist.length - 1]) {
                setHistory([...hist, current]);
                setHistoryIdx(hist.length);
            }
        }
    }

    function undo() {
        flushDebounce();
        const idx = historyIdx();
        if (idx > 0) {
            const newIdx = idx - 1;
            setHistoryIdx(newIdx);
            restore(history()[newIdx]);
        }
    }

    function redo() {
        const idx = historyIdx();
        const hist = history();
        if (idx < hist.length - 1) {
            const newIdx = idx + 1;
            setHistoryIdx(newIdx);
            restore(hist[newIdx]);
        }
    }

    const canUndo = () => {
        tick();
        return historyIdx() > 0 || debounceTimer !== undefined;
    };

    const canRedo = () => {
        tick();
        return historyIdx() < history().length - 1;
    };

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
        [
            {
                icon: () => {
                    tick();
                    const inst = editor();
                    return inst?.isActive("link") ? (
                        <TbOutlineLinkOff />
                    ) : (
                        <TbOutlineLink />
                    );
                },
                title: "Link",
                action: (e) => {
                    if (e.isActive("link")) {
                        e.chain().focus().unsetLink().run();
                        return;
                    }
                    setLinkUrl("");
                    setLinkModalOpen(true);
                },
                isActive: (e) => e.isActive("link"),
            },
            {
                icon: () => <TbOutlinePhoto />,
                title: "Image",
                action: () => {
                    setImageUrl("");
                    setImageModalOpen(true);
                },
            },
        ],
    ];

    function handleEscape(e: KeyboardEvent) {
        if (e.key === "Escape" && fullscreen()) {
            if (linkModalOpen() || imageModalOpen()) return;
            setFullscreen(false);
        }
    }

    onMount(() => {
        document.addEventListener("keydown", handleEscape);
        const e = new Editor({
            element: editorRef,
            extensions: [
                StarterKit.configure({
                    undoRedo: false,
                    link: { openOnClick: false },
                }),
                Image.configure({ inline: false }),
                Markdown.configure({ html: false, transformPastedText: true }),
                Placeholder.configure({ placeholder: "Start writing..." }),
            ],
            content: props.value,
            onUpdate: ({ editor: inst }) => {
                handleChange(getMarkdown(inst));
                setTick((t) => t + 1);
            },
            onSelectionUpdate: () => {
                setTick((t) => t + 1);
            },
        });
        setEditor(e);
    });

    onCleanup(() => {
        document.removeEventListener("keydown", handleEscape);
        clearTimeout(debounceTimer);
        editor()?.destroy();
    });

    function switchMode(newMode: "rich" | "markdown") {
        if (newMode === mode()) return;
        const e = editor();

        isRestoring = true;
        if (newMode === "markdown" && e) {
            props.onChange(getMarkdown(e));
        } else if (newMode === "rich" && e) {
            e.commands.setContent(props.value);
        }
        isRestoring = false;

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
            <div
                class={`blog-editor${fullscreen() ? " fullscreen" : ""}`}
                onKeyDown={(e) => {
                    const mod = e.ctrlKey || e.metaKey;
                    if (mod && e.key === "z" && !e.shiftKey) {
                        e.preventDefault();
                        undo();
                    } else if (
                        mod &&
                        (e.key === "Z" ||
                            (e.key === "z" && e.shiftKey) ||
                            (e.key === "y" && !e.shiftKey))
                    ) {
                        e.preventDefault();
                        redo();
                    }
                }}
            >
                <div class="blog-editor-toolbar">
                    <div class="toolbar-group">
                        <button
                            type="button"
                            class="toolbar-btn"
                            title="Undo (Ctrl+Z)"
                            onClick={() => undo()}
                            disabled={!canUndo()}
                        >
                            <TbOutlineArrowBackUp />
                        </button>
                        <button
                            type="button"
                            class="toolbar-btn"
                            title="Redo (Ctrl+Shift+Z)"
                            onClick={() => redo()}
                            disabled={!canRedo()}
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
                                handleChange(ta.value);
                            }}
                        />
                    </div>
                </Show>

                <div class="blog-editor-footer">
                    <button
                        type="button"
                        class="toolbar-btn"
                        title={
                            fullscreen()
                                ? "Exit fullscreen (Esc)"
                                : "Fullscreen"
                        }
                        onClick={() => setFullscreen((f) => !f)}
                    >
                        <Show
                            when={fullscreen()}
                            fallback={<TbOutlineArrowsMaximize />}
                        >
                            <TbOutlineArrowsMinimize />
                        </Show>
                    </button>
                    <span class="footer-spacer" />
                    <span>{wordCount()} words</span>
                </div>
            </div>

            <FormModal
                open={linkModalOpen()}
                title="Insert Link"
                confirmLabel="Insert"
                onSubmit={() => {
                    const e = editor();
                    if (e && linkUrl()) {
                        e.chain().focus().setLink({ href: linkUrl() }).run();
                    }
                    setLinkModalOpen(false);
                }}
                onCancel={() => setLinkModalOpen(false)}
            >
                <TextInput
                    value={linkUrl()}
                    onInput={setLinkUrl}
                    type="url"
                    variant="form"
                    color="page"
                    placeholder="https://example.com"
                    required
                    ref={(el) => requestAnimationFrame(() => el.focus())}
                />
            </FormModal>

            <FormModal
                open={imageModalOpen()}
                title="Insert Image"
                confirmLabel="Insert"
                onSubmit={() => {
                    const e = editor();
                    if (e && imageUrl()) {
                        e.chain().focus().setImage({ src: imageUrl() }).run();
                    }
                    setImageModalOpen(false);
                }}
                onCancel={() => setImageModalOpen(false)}
            >
                <TextInput
                    value={imageUrl()}
                    onInput={setImageUrl}
                    type="url"
                    variant="form"
                    color="page"
                    placeholder="https://example.com/image.jpg"
                    required
                    ref={(el) => requestAnimationFrame(() => el.focus())}
                />
            </FormModal>
        </>
    );
}
