module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	globals: {
		"ts-jest": {
			tsconfig: "./tsconfig.jest.json",
		},
	},
	testMatch: [
		"<rootDir>/**/*.test.ts"
	],
	coverageDirectory: ".output/coverage",
	coverageReporters: ["html", "json"],
};
