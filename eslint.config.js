import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid/configs/typescript";
import prettier from "eslint-config-prettier";

export default tseslint.config(
    {
        ignores: [
            "node_modules/",
            ".vinxi/",
            ".output/",
            "dist/",
        ],
    },
    ...tseslint.configs.recommended,
    solid,
    prettier,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
    },
);
