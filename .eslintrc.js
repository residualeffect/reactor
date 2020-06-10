module.exports = {
	env: { browser: true, commonjs: true, es6: true },
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "./tsconfig.eslint.json",
	},
	plugins: ["@typescript-eslint"],
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
	],
	rules: {
		"@typescript-eslint/interface-name-prefix": "off",
		"@typescript-eslint/ban-types": "off",
		"semi": ["error", "always"],
		"eol-last": ["error", "always"],
		"lines-between-class-members": ["error", "always", {exceptAfterSingleLine: true}],
	}
};
