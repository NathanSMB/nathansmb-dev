import { render, fireEvent } from "@solidjs/testing-library";
import Button from "~/components/ui/Button";

describe("Button", () => {
    it("renders with default primary color and default variant", () => {
        const { getByRole } = render(() => <Button>Click</Button>);
        const btn = getByRole("button");
        expect(btn.className).toContain("btn-primary");
        expect(btn.className).toContain("shape-default");
        expect(btn.className).toContain("shape-md");
    });

    it("applies danger color class", () => {
        const { getByRole } = render(() => <Button color="danger">Del</Button>);
        expect(getByRole("button").className).toContain("btn-danger");
    });

    it("applies pill variant class", () => {
        const { getByRole } = render(() => <Button variant="pill">Tag</Button>);
        expect(getByRole("button").className).toContain("shape-pill");
    });

    it("does not add size class for pill variant", () => {
        const { getByRole } = render(() => <Button variant="pill">Tag</Button>);
        const cls = getByRole("button").className;
        expect(cls).not.toContain("shape-sm");
        expect(cls).not.toContain("shape-md");
        expect(cls).not.toContain("shape-lg");
    });

    it("applies size classes", () => {
        const { getByRole: sm } = render(() => <Button size="sm">S</Button>);
        expect(sm("button").className).toContain("shape-sm");

        const { getByRole: lg } = render(() => <Button size="lg">L</Button>);
        expect(lg("button").className).toContain("shape-lg");
    });

    it("calls onClick handler", async () => {
        const handler = vi.fn();
        const { getByRole } = render(() => (
            <Button onClick={handler}>Go</Button>
        ));
        fireEvent.click(getByRole("button"));
        expect(handler).toHaveBeenCalledOnce();
    });

    it("can be disabled", () => {
        const { getByRole } = render(() => <Button disabled>No</Button>);
        expect((getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    });

    it("defaults to type=button", () => {
        const { getByRole } = render(() => <Button>OK</Button>);
        expect(getByRole("button").getAttribute("type")).toBe("button");
    });

    it("accepts type=submit", () => {
        const { getByRole } = render(() => <Button type="submit">Send</Button>);
        expect(getByRole("button").getAttribute("type")).toBe("submit");
    });

    it("appends custom class", () => {
        const { getByRole } = render(() => <Button class="extra">X</Button>);
        expect(getByRole("button").className).toContain("extra");
    });
});
