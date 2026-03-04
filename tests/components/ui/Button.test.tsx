import { render, fireEvent } from "@solidjs/testing-library";
import Button from "~/components/ui/Button";

describe("Button", () => {
    it("renders with default primary color and btn variant", () => {
        const { getByRole } = render(() => <Button>Click</Button>);
        const btn = getByRole("button");
        expect(btn.className).toContain("btn-primary");
        expect(btn.className).toContain("shape-btn");
    });

    it("applies danger color class", () => {
        const { getByRole } = render(() => <Button color="danger">Del</Button>);
        expect(getByRole("button").className).toContain("btn-danger");
    });

    it("applies pill variant class", () => {
        const { getByRole } = render(() => <Button variant="pill">Tag</Button>);
        expect(getByRole("button").className).toContain("shape-pill");
    });

    it("applies form variant class", () => {
        const { getByRole } = render(() => (
            <Button variant="form">Submit</Button>
        ));
        expect(getByRole("button").className).toContain("shape-form");
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
