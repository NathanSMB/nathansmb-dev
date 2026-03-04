import { render, fireEvent } from "@solidjs/testing-library";
import TextInput from "~/components/ui/TextInput";

describe("TextInput", () => {
    it("applies inline variant class by default", () => {
        const { container } = render(() => (
            <TextInput value="" onInput={() => {}} />
        ));
        const input = container.querySelector("input") as HTMLElement;
        expect(input.className).toContain("input-inline");
    });

    it("applies toolbar variant class", () => {
        const { container } = render(() => (
            <TextInput value="" onInput={() => {}} variant="toolbar" />
        ));
        const input = container.querySelector("input") as HTMLElement;
        expect(input.className).toContain("input-toolbar");
    });

    it("applies form variant class", () => {
        const { container } = render(() => (
            <TextInput value="" onInput={() => {}} variant="form" />
        ));
        const input = container.querySelector("input") as HTMLElement;
        expect(input.className).toContain("input-form");
    });

    it("calls onInput with the value", () => {
        const handler = vi.fn();
        const { container } = render(() => (
            <TextInput value="" onInput={handler} />
        ));
        const input = container.querySelector("input") as HTMLInputElement;
        fireEvent.input(input, { target: { value: "hello" } });
        expect(handler).toHaveBeenCalledWith("hello");
    });

    it("defaults to type=text", () => {
        const { container } = render(() => (
            <TextInput value="" onInput={() => {}} />
        ));
        const input = container.querySelector("input") as HTMLInputElement;
        expect(input.type).toBe("text");
    });

    it("accepts type=email", () => {
        const { container } = render(() => (
            <TextInput value="" onInput={() => {}} type="email" />
        ));
        const input = container.querySelector("input") as HTMLInputElement;
        expect(input.type).toBe("email");
    });

    it("appends custom class", () => {
        const { container } = render(() => (
            <TextInput value="" onInput={() => {}} class="extra" />
        ));
        const input = container.querySelector("input") as HTMLElement;
        expect(input.className).toContain("extra");
    });
});
