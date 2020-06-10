import { FilteredObservable } from "../src/FilteredObservable";
import { ThenObserverCallCountIs, ThenObserverWasCalled } from "./TestHelpers";

let mockObserver: jest.Mock;

beforeEach(() => {
	mockObserver = jest.fn();
});

test("Should not apply filter to initial value", () => {
	const t = new FilteredObservable("Testing", (x, s) => s(x + "World"));

	expect(t.Value).toStrictEqual("Testing");
});

test("Should apply filter when value is modified", () => {
	const t = new FilteredObservable("Testing", (x, s) => s(x + "World"));

	t.Value = "Hello";

	expect(t.Value).toStrictEqual("HelloWorld");
});

test("Should not notify subscribers when value doesn't change", () => {
	const t = new FilteredObservable("Testing", (x, s) => s(x + "World"));
	t.Subscribe(mockObserver);

	t.Value = "Testing";

	ThenObserverCallCountIs(mockObserver, 0);
});

test("Should notify observers on change, even if value is roughly equivalent", () => {
	const t = new FilteredObservable<number|boolean>(true, (x, s) => s(x));
	t.Subscribe(mockObserver);

	t.Value = 1;
	ThenObserverWasCalled(mockObserver, 1, 1);

	t.Value = true;
	ThenObserverWasCalled(mockObserver, 2, true);
});
