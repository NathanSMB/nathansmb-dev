import { render, fireEvent } from "@solidjs/testing-library";
import Checkbox from "~/components/ui/Checkbox";

describe("Checkbox", () => {
    it("renders as checked when checked prop is true", () => {
        const { container } = render(() => (
            <Checkbox checked={true} onChange={() => {}} />
        ));
        const input = container.querySelector("input") as HTMLInputElement;
        expect(input.checked).toBe(true);
    });

    it("renders as unchecked when checked prop is false", () => {
        const { container } = render(() => (
            <Checkbox checked={false} onChange={() => {}} />
        ));
        const input = container.querySelector("input") as HTMLInputElement;
        expect(input.checked).toBe(false);
    });

    it("calls onChange when clicked", () => {
        const handler = vi.fn();
        const { container } = render(() => (
            <Checkbox checked={false} onChange={handler} />
        ));
        const input = container.querySelector("input") as HTMLInputElement;
        fireEvent.change(input);
        expect(handler).toHaveBeenCalledOnce();
    });

    it("can be disabled", () => {
        const { container } = render(() => (
            <Checkbox checked={false} onChange={() => {}} disabled />
        ));
        const input = container.querySelector("input") as HTMLInputElement;
        expect(input.disabled).toBe(true);
    });

    it("has checkbox class", () => {
        const { container } = render(() => (
            <Checkbox checked={false} onChange={() => {}} />
        ));
        const input = container.querySelector("input") as HTMLElement;
        expect(input.className).toContain("checkbox");
    });
});
