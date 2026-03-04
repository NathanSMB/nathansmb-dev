import { render, fireEvent } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import Slider from "~/components/ui/Slider";

describe("Slider", () => {
    it("renders range and number inputs with correct value", () => {
        const { container } = render(() => (
            <Slider value={50} onInput={() => {}} />
        ));
        const range = container.querySelector(
            ".slider-range",
        ) as HTMLInputElement;
        const number = container.querySelector(
            ".slider-number",
        ) as HTMLInputElement;
        expect(range.value).toBe("50");
        expect(number.value).toBe("50");
    });

    it("uses default min/max of 0/100", () => {
        const { container } = render(() => (
            <Slider value={0} onInput={() => {}} />
        ));
        const range = container.querySelector(
            ".slider-range",
        ) as HTMLInputElement;
        expect(range.min).toBe("0");
        expect(range.max).toBe("100");
    });

    it("calls onInput when range input changes", () => {
        const handler = vi.fn();
        const { container } = render(() => (
            <Slider value={10} onInput={handler} />
        ));
        const range = container.querySelector(
            ".slider-range",
        ) as HTMLInputElement;
        fireEvent.input(range, { target: { value: "75" } });
        expect(handler).toHaveBeenCalled();
    });

    it("calls onInput when number input changes with valid number", () => {
        const handler = vi.fn();
        const { container } = render(() => (
            <Slider value={10} onInput={handler} />
        ));
        const number = container.querySelector(
            ".slider-number",
        ) as HTMLInputElement;
        fireEvent.input(number, { target: { value: "42" } });
        expect(handler).toHaveBeenCalled();
    });

    it("does not call onInput for NaN number input", () => {
        const handler = vi.fn();
        const { container } = render(() => (
            <Slider value={10} onInput={handler} />
        ));
        const number = container.querySelector(
            ".slider-number",
        ) as HTMLInputElement;
        fireEvent.input(number, { target: { value: "abc" } });
        expect(handler).not.toHaveBeenCalled();
    });

    it("clamps value on blur", () => {
        const [, setValue] = createSignal(50);
        const captured: number[] = [];
        const { container } = render(() => (
            <Slider
                value={50}
                onInput={(v) => {
                    captured.push(v);
                    setValue(v);
                }}
                min={10}
                max={90}
            />
        ));
        const number = container.querySelector(
            ".slider-number",
        ) as HTMLInputElement;
        fireEvent.blur(number, { target: { value: "200" } });
        expect(captured[captured.length - 1]).toBe(90);
    });

    it("resets to min on blur with NaN", () => {
        const captured: number[] = [];
        const { container } = render(() => (
            <Slider
                value={50}
                onInput={(v) => captured.push(v)}
                min={5}
                max={95}
            />
        ));
        const number = container.querySelector(
            ".slider-number",
        ) as HTMLInputElement;
        fireEvent.blur(number, { target: { value: "abc" } });
        expect(captured[captured.length - 1]).toBe(5);
    });

    it("applies background gradient based on percentage", () => {
        const { container } = render(() => (
            <Slider value={50} onInput={() => {}} min={0} max={100} />
        ));
        const range = container.querySelector(
            ".slider-range",
        ) as HTMLInputElement;
        expect(range.style.background).toContain("50%");
    });
});
