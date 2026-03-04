import { render } from "@solidjs/testing-library";
import Pill from "~/components/ui/Pill";

describe("Pill", () => {
    it("applies primary color by default", () => {
        const { container } = render(() => <Pill>Tag</Pill>);
        const span = container.querySelector(".shape-pill") as HTMLElement;
        expect(span.className).toContain("pill-primary");
    });

    it("applies danger color variant", () => {
        const { container } = render(() => <Pill color="danger">Warn</Pill>);
        const span = container.querySelector(".shape-pill") as HTMLElement;
        expect(span.className).toContain("pill-danger");
    });

    it("applies success color variant", () => {
        const { container } = render(() => <Pill color="success">OK</Pill>);
        const span = container.querySelector(".shape-pill") as HTMLElement;
        expect(span.className).toContain("pill-success");
    });

    it("applies neutral color variant", () => {
        const { container } = render(() => <Pill color="neutral">Meh</Pill>);
        const span = container.querySelector(".shape-pill") as HTMLElement;
        expect(span.className).toContain("pill-neutral");
    });

    it("renders children", () => {
        const { getByText } = render(() => <Pill>Hello</Pill>);
        expect(getByText("Hello")).toBeTruthy();
    });
});
