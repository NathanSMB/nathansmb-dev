import { render } from "@solidjs/testing-library";
import Banner from "~/components/ui/Banner";

describe("Banner", () => {
    it("renders with the error variant class", () => {
        const { container } = render(() => (
            <Banner variant="error" message="Something went wrong" />
        ));
        const banner = container.querySelector(".banner") as HTMLElement;
        expect(banner.className).toContain("banner-error");
    });

    it("renders with the success variant class", () => {
        const { container } = render(() => (
            <Banner variant="success" message="Done!" />
        ));
        const banner = container.querySelector(".banner") as HTMLElement;
        expect(banner.className).toContain("banner-success");
    });

    it("renders the message text", () => {
        const { getByText } = render(() => (
            <Banner variant="info" message="Hello" />
        ));
        expect(getByText("Hello")).toBeTruthy();
    });

    it("is hidden when message is null", () => {
        const { container } = render(() => (
            <Banner variant="error" message={null} />
        ));
        expect(container.querySelector(".banner")).toBeNull();
    });

    it("is hidden when message is undefined", () => {
        const { container } = render(() => (
            <Banner variant="error" message={undefined} />
        ));
        expect(container.querySelector(".banner")).toBeNull();
    });

    it("is hidden when message is false", () => {
        const { container } = render(() => (
            <Banner variant="error" message={false} />
        ));
        expect(container.querySelector(".banner")).toBeNull();
    });
});
