module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	globals: {
		"ts-jest": {
			tsConfig: "./tsconfig.jest.json",
		},
	},
	testMatch: [
		"<rootDir>/**/*.test.ts"
	],
	coverageDirectory: ".output/coverage",
	coverageReporters: ["html", "json"],
};
