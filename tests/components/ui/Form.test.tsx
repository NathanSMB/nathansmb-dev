import { render, fireEvent } from "@solidjs/testing-library";
import Form from "~/components/ui/Form";

describe("Form", () => {
    it("calls onSubmit and prevents default", () => {
        const handler = vi.fn();
        const { container } = render(() => (
            <Form onSubmit={handler}>
                <button type="submit">Go</button>
            </Form>
        ));
        const form = container.querySelector("form") as HTMLFormElement;
        const submitEvent = new Event("submit", {
            bubbles: true,
            cancelable: true,
        });
        form.dispatchEvent(submitEvent);
        expect(handler).toHaveBeenCalledOnce();
        expect(submitEvent.defaultPrevented).toBe(true);
    });

    it("applies default variant class", () => {
        const { container } = render(() => (
            <Form onSubmit={() => {}}>
                <span>Content</span>
            </Form>
        ));
        const form = container.querySelector("form") as HTMLElement;
        expect(form.className).toContain("form-default");
    });

    it("applies inline variant class", () => {
        const { container } = render(() => (
            <Form variant="inline" onSubmit={() => {}}>
                <span>Content</span>
            </Form>
        ));
        const form = container.querySelector("form") as HTMLElement;
        expect(form.className).toContain("form-inline");
    });

    it("appends custom class", () => {
        const { container } = render(() => (
            <Form class="my-form" onSubmit={() => {}}>
                <span>Content</span>
            </Form>
        ));
        const form = container.querySelector("form") as HTMLElement;
        expect(form.className).toContain("my-form");
    });
});
