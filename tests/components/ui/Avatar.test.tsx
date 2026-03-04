import { render } from "@solidjs/testing-library";
import Avatar from "~/components/ui/Avatar";

describe("Avatar", () => {
    it("renders an image when image prop is provided", () => {
        const { container } = render(() => (
            <Avatar image="https://example.com/pic.jpg" name="Alice" />
        ));
        const img = container.querySelector("img") as HTMLImageElement;
        expect(img).toBeTruthy();
        expect(img.src).toBe("https://example.com/pic.jpg");
    });

    it("renders a placeholder initial when no image", () => {
        const { getByText } = render(() => <Avatar name="bob" />);
        expect(getByText("B")).toBeTruthy();
    });

    it("renders a placeholder when image is null", () => {
        const { getByText } = render(() => (
            <Avatar image={null} name="Charlie" />
        ));
        expect(getByText("C")).toBeTruthy();
    });

    it("applies avatar-lg class for lg size", () => {
        const { container } = render(() => <Avatar name="Dave" size="lg" />);
        const el = container.querySelector(".avatar") as HTMLElement;
        expect(el.className).toContain("avatar-lg");
    });

    it("does not apply avatar-lg for default size", () => {
        const { container } = render(() => <Avatar name="Eve" />);
        const el = container.querySelector(".avatar") as HTMLElement;
        expect(el.className).not.toContain("avatar-lg");
    });
});
