import { render } from "@solidjs/testing-library";
import Spinner from "~/components/ui/Spinner";

describe("Spinner", () => {
    it("defaults to lg size", () => {
        const { container } = render(() => <Spinner />);
        const wrapper = container.querySelector(
            ".spinner-container",
        ) as HTMLElement;
        expect(wrapper.className).toContain("spinner-lg");
    });

    it("applies xs size class", () => {
        const { container } = render(() => <Spinner size="xs" />);
        const wrapper = container.querySelector(
            ".spinner-container",
        ) as HTMLElement;
        expect(wrapper.className).toContain("spinner-xs");
    });

    it("applies sm size class", () => {
        const { container } = render(() => <Spinner size="sm" />);
        const wrapper = container.querySelector(
            ".spinner-container",
        ) as HTMLElement;
        expect(wrapper.className).toContain("spinner-sm");
    });

    it("applies center class when center prop is true", () => {
        const { container } = render(() => <Spinner center />);
        const wrapper = container.querySelector(
            ".spinner-container",
        ) as HTMLElement;
        expect(wrapper.className).toContain("spinner-center");
    });

    it("does not apply center class by default", () => {
        const { container } = render(() => <Spinner />);
        const wrapper = container.querySelector(
            ".spinner-container",
        ) as HTMLElement;
        expect(wrapper.className).not.toContain("spinner-center");
    });
});
