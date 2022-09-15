module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	transform: {
		"\.ts$": ["ts-jest", { tsconfig: "./tsconfig.jest.json" }]
	},
	testMatch: [
		"<rootDir>/**/*.test.ts"
	],
	coverageDirectory: ".output/coverage",
	coverageReporters: ["html", "json"],
};
