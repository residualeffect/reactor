import { ReadOnlyObservable } from "../src/ReadOnlyObservable";

test("Should have value", () => {
	const t = new ReadOnlyObservable(true);

	expect(t.Value).toBe(true);
});
