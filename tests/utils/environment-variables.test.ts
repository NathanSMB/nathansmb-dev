import { getString, getAnyString } from "~/utils/environment-variables";

describe("getString", () => {
    it("returns the value when the env var is set", () => {
        process.env.TEST_VAR = "hello";
        expect(getString("TEST_VAR")).toBe("hello");
        delete process.env.TEST_VAR;
    });

    it("throws when the env var is not set", () => {
        delete process.env.MISSING_VAR;
        expect(() => getString("MISSING_VAR")).toThrow(
            "The MISSING_VAR environment variable is not set.",
        );
    });

    it("throws when the env var is an empty string", () => {
        process.env.EMPTY_VAR = "";
        expect(() => getString("EMPTY_VAR")).toThrow(
            "The EMPTY_VAR environment variable is not set.",
        );
        delete process.env.EMPTY_VAR;
    });
});

describe("getAnyString", () => {
    it("returns the first matching env var", () => {
        process.env.FIRST = "a";
        process.env.SECOND = "b";
        expect(getAnyString(["FIRST", "SECOND"])).toBe("a");
        delete process.env.FIRST;
        delete process.env.SECOND;
    });

    it("skips empty vars and returns the next match", () => {
        process.env.EMPTY_ONE = "";
        process.env.GOOD_ONE = "found";
        expect(getAnyString(["EMPTY_ONE", "GOOD_ONE"])).toBe("found");
        delete process.env.EMPTY_ONE;
        delete process.env.GOOD_ONE;
    });

    it("skips missing vars and returns the next match", () => {
        delete process.env.NOPE;
        process.env.YEP = "ok";
        expect(getAnyString(["NOPE", "YEP"])).toBe("ok");
        delete process.env.YEP;
    });

    it("throws when none of the env vars are set", () => {
        delete process.env.A;
        delete process.env.B;
        expect(() => getAnyString(["A", "B"])).toThrow(
            "None of the environment variables are set: A, B",
        );
    });
});
