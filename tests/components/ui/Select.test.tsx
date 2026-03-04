import { render, fireEvent } from "@solidjs/testing-library";
import Select from "~/components/ui/Select";

const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
    { value: "c", label: "Gamma" },
];

describe("Select", () => {
    it("displays the selected option label", () => {
        const { getByText } = render(() => (
            <Select value="b" options={options} onChange={() => {}} />
        ));
        expect(getByText("Beta")).toBeTruthy();
    });

    it("falls back to value if no option matches", () => {
        const { getByText } = render(() => (
            <Select value="unknown" options={options} onChange={() => {}} />
        ));
        expect(getByText("unknown")).toBeTruthy();
    });

    it("opens dropdown on click", async () => {
        const { container, getByRole } = render(() => (
            <Select value="a" options={options} onChange={() => {}} />
        ));
        fireEvent.click(getByRole("button"));
        expect(container.querySelector(".select-dropdown")).toBeTruthy();
    });

    it("closes dropdown on second click", async () => {
        const { container, getByRole } = render(() => (
            <Select value="a" options={options} onChange={() => {}} />
        ));
        const trigger = getByRole("button");
        fireEvent.click(trigger);
        fireEvent.click(trigger);
        expect(container.querySelector(".select-dropdown")).toBeNull();
    });

    it("calls onChange when option is selected", () => {
        const handler = vi.fn();
        const { getByRole, getByText } = render(() => (
            <Select value="a" options={options} onChange={handler} />
        ));
        fireEvent.click(getByRole("button"));
        fireEvent.mouseDown(getByText("Gamma"));
        expect(handler).toHaveBeenCalledWith("c");
    });

    it("closes dropdown on Escape", () => {
        const { container, getByRole } = render(() => (
            <Select value="a" options={options} onChange={() => {}} />
        ));
        fireEvent.click(getByRole("button"));
        expect(container.querySelector(".select-dropdown")).toBeTruthy();
        fireEvent.keyDown(container.querySelector(".select-wrapper")!, {
            key: "Escape",
        });
        expect(container.querySelector(".select-dropdown")).toBeNull();
    });

    it("closes dropdown on click outside", () => {
        const { container, getByRole } = render(() => (
            <Select value="a" options={options} onChange={() => {}} />
        ));
        fireEvent.click(getByRole("button"));
        expect(container.querySelector(".select-dropdown")).toBeTruthy();
        fireEvent.mouseDown(document.body);
        expect(container.querySelector(".select-dropdown")).toBeNull();
    });
});
