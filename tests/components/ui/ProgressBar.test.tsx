import { render } from "@solidjs/testing-library";
import ProgressBar from "~/components/ui/ProgressBar";

describe("ProgressBar", () => {
    it("shows label text with default 'completed'", () => {
        const { getByText } = render(() => (
            <ProgressBar current={3} total={10} />
        ));
        expect(getByText("3 of 10 completed")).toBeTruthy();
    });

    it("uses custom label", () => {
        const { getByText } = render(() => (
            <ProgressBar current={1} total={5} label="created" />
        ));
        expect(getByText("1 of 5 created")).toBeTruthy();
    });

    it("sets fill width percentage", () => {
        const { container } = render(() => (
            <ProgressBar current={5} total={10} />
        ));
        const fill = container.querySelector(
            ".progress-bar-fill",
        ) as HTMLElement;
        expect(fill.style.width).toBe("50%");
    });

    it("handles zero total safely", () => {
        const { container } = render(() => (
            <ProgressBar current={0} total={0} />
        ));
        const fill = container.querySelector(
            ".progress-bar-fill",
        ) as HTMLElement;
        expect(fill.style.width).toBe("0%");
    });

    it("applies primary color by default", () => {
        const { container } = render(() => (
            <ProgressBar current={1} total={2} />
        ));
        const bar = container.querySelector(".progress-bar") as HTMLElement;
        expect(bar.className).toContain("progress-bar-primary");
    });

    it("applies error color variant", () => {
        const { container } = render(() => (
            <ProgressBar current={1} total={2} color="error" />
        ));
        const bar = container.querySelector(".progress-bar") as HTMLElement;
        expect(bar.className).toContain("progress-bar-error");
    });

    it("applies success color variant", () => {
        const { container } = render(() => (
            <ProgressBar current={1} total={2} color="success" />
        ));
        const bar = container.querySelector(".progress-bar") as HTMLElement;
        expect(bar.className).toContain("progress-bar-success");
    });
});
