import { FilteredObservable } from "../src/FilteredObservable";

test("Should not apply filter to initial value", () => {
	const t = new FilteredObservable("Testing", (x, s) => s(x + "World"));

	expect(t.Value).toStrictEqual("Testing");
});

test("Should apply filter when value is modified", () => {
	const t = new FilteredObservable("Testing", (x, s) => s(x + "World"));

	t.Value = "Hello";

	expect(t.Value).toStrictEqual("HelloWorld");
});
