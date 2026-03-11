import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export async function sanitizeMarkdown(content: string): Promise<string> {
    const rawHtml = await marked(content);

    return sanitizeHtml(rawHtml, {
        allowedTags: [
            "p",
            "br",
            "strong",
            "em",
            "del",
            "a",
            "ul",
            "ol",
            "li",
            "code",
            "pre",
            "blockquote",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "hr",
            "img",
        ],
        allowedAttributes: {
            a: ["href", "rel", "target"],
            img: ["src", "alt"],
        },
        allowedSchemes: ["http", "https"],
        transformTags: {
            a: (tagName, attribs) => ({
                tagName,
                attribs: {
                    ...attribs,
                    rel: "nofollow noopener",
                    target: "_blank",
                },
            }),
        },
    });
}
