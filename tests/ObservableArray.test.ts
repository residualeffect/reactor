import { ObservableArray } from "../src/ObservableArray";
import { Computed } from "../src/Computed";
import { ThenObserverWasCalled, ThenObserverCallCountIs } from "./TestHelpers";

let mockObserver: jest.Mock;

beforeEach(() => {
	mockObserver = jest.fn();
});

test("Should be able to read value of observable array", () => {
	const t = new ObservableArray<string>(["Hello", "World"]);

	expect(t.Value).toStrictEqual(["Hello", "World"]);
});

test("Should be able to find elements in array", () => {
	const t = new ObservableArray<string>(["Hello", "World"]);

	expect(t.Value.indexOf("World")).toStrictEqual(1);
});

test("Should notify observers when array is set", () => {
	const t = new ObservableArray<string>(["Hello", "World"]);
	t.Subscribe(mockObserver);

	t.Value = ["Testing"];
	ThenObserverWasCalled(mockObserver, 1, ["Testing"]);
});

test("Should notify observers when array is cleared", () => {
	const t = new ObservableArray<string>(["Hello", "World"]);
	t.Subscribe(mockObserver);

	t.clear();
	ThenObserverWasCalled(mockObserver, 1, []);
});

test("Should notify observers when value is pushed", () => {
	const t = new ObservableArray<string>(["Hello"]);
	t.Subscribe(mockObserver);

	t.push("World");
	ThenObserverWasCalled(mockObserver, 1, ["Hello", "World"]);
});

test("Should notify observers when value is popped", () => {
	const t = new ObservableArray<string>(["Hello"]);
	t.Subscribe(mockObserver);

	const popped = t.pop();
	expect(popped).toStrictEqual("Hello");
	ThenObserverWasCalled(mockObserver, 1, []);
});

test("Should notify observers when value is shifted", () => {
	const t = new ObservableArray<string>(["Hello"]);
	t.Subscribe(mockObserver);

	const shifted = t.shift();
	expect(shifted).toStrictEqual("Hello");
	ThenObserverWasCalled(mockObserver, 1, []);
});

test("Should notify observers when value is unshifted", () => {
	const t = new ObservableArray<string>(["Hello"]);
	t.Subscribe(mockObserver);

	t.unshift("World");
	ThenObserverWasCalled(mockObserver, 1, ["World", "Hello"]);
});

test("Should notify observers when an array of values is concatenated", () => {
	const t = new ObservableArray<string>(["Hello"]);
	t.Subscribe(mockObserver);

	t.concat(["World", "Hey"]);
	ThenObserverWasCalled(mockObserver, 1, ["Hello", "World", "Hey"]);
});

test("Should notify observers when value is reversed", () => {
	const t = new ObservableArray<string>(["Hello", "World"]);
	t.Subscribe(mockObserver);

	t.reverse();
	ThenObserverWasCalled(mockObserver, 1, ["World", "Hello"]);
});

test("Should notify observers when value is sorted", () => {
	const t = new ObservableArray<string>(["World", "Hello"]);
	t.Subscribe(mockObserver);

	t.sort((a, b) => a.localeCompare(b));
	ThenObserverWasCalled(mockObserver, 1, ["Hello", "World"]);
});

test("Should notify observers when value is spliced", () => {
	const t = new ObservableArray<string>(["Hello", "Amazing", "World"]);
	t.Subscribe(mockObserver);

	const removed = t.splice(1, 1, "Testing");
	expect(removed).toStrictEqual(["Amazing"]);
	ThenObserverWasCalled(mockObserver, 1, ["Hello", "Testing", "World"]);
});

test("Should remove item from array when called", () => {
	const t = new ObservableArray<string>(["Hello", "Amazing", "World"]);
	t.Subscribe(mockObserver);

	const wasRemoved = t.remove("Amazing");
	expect(wasRemoved).toStrictEqual(true);
	ThenObserverWasCalled(mockObserver, 1, ["Hello", "World"]);
});

test("Should not remove item from array when called with value not present in array", () => {
	const t = new ObservableArray<string>(["Hello", "Amazing", "World"]);
	t.Subscribe(mockObserver);

	const wasRemoved = t.remove("Something Not In Array");
	expect(wasRemoved).toStrictEqual(false);
	ThenObserverCallCountIs(mockObserver, 0);
});

test("Should notify observers when array values are swapped", () => {
	const t = new ObservableArray<string>(["Hello", "World"]);
	t.Subscribe(mockObserver);

	t.swap(0, 1);
	ThenObserverWasCalled(mockObserver, 1, ["World", "Hello"]);
});

test("Should be able to get a copy of the observable array, and modify it without notifying observers", () => {
	const t = new ObservableArray<string>(["Hello", "World"]);
	t.Subscribe(mockObserver);

	const a = t.AsArray();
	a[0] = "Hah I Modified you!";

	ThenObserverCallCountIs(mockObserver, 0);
});

test("Should notify observers after changes have been made via Update func", () => {
	const t = new ObservableArray<string>(["Hello", "World"]);
	t.Subscribe(mockObserver);

	t.Update(x => { x[0] = "Hey"; });

	ThenObserverWasCalled(mockObserver, 1, ["Hey", "World"]);
});

test("Should still notify observers even if no changes are made via Update func", () => {
	const t = new ObservableArray<string>(["Hello", "World"]);
	t.Subscribe(mockObserver);

	t.Update(() => { /* DOES NOTHING */ });

	ThenObserverWasCalled(mockObserver, 1, ["Hello", "World"]);
});

test("Should notify observers after changes have been made via UpdateWhen func", () => {
	const t = new ObservableArray<string>(["Hello", "World"]);
	t.Subscribe(mockObserver);

	t.UpdateWhen(x => x[0] === "Hello", x => x[0] = "Hey");

	ThenObserverWasCalled(mockObserver, 1, ["Hey", "World"]);
});

test("Should not notify observers if condition is not met during UpdateWhen func", () => {
	const t = new ObservableArray<string>(["Hello", "World"]);
	t.Subscribe(mockObserver);

	t.UpdateWhen(x => x[0] !== "Hello", x => x[0] = "Hey");

	ThenObserverCallCountIs(mockObserver, 0);
});

test("Should not allow changes to source array passed in to constructor or Value to modify underlying array", () => {
	const source = ["Hello", "World"];
	const t = new ObservableArray<string>(source);
	t.Subscribe(mockObserver);

	expect(t.Value).toStrictEqual(["Hello", "World"]);

	source.push("What");
	expect(t.Value).toStrictEqual(["Hello", "World"]);

	ThenObserverCallCountIs(mockObserver, 0);

	const anotherSource = ["Just", "Testing"];
	t.Value = anotherSource;

	ThenObserverWasCalled(mockObserver, 1, ["Just", "Testing"]);

	anotherSource.push("What");
	expect(t.Value).toStrictEqual(["Just", "Testing"]);

	ThenObserverCallCountIs(mockObserver, 1);
});

test("Should trigger updates to computed observable when accessing length", () => {
	const t = new ObservableArray<string>(["Hello", "Amazing", "World"]);
	const c = new Computed<string>(() => {
		if (t.length > 3) {
			return "Yep";
		}
		return "Nope";
	});
	c.Subscribe(mockObserver);

	expect(c.Value).toStrictEqual("Nope");

	t.push("What");
	expect(c.Value).toStrictEqual("Yep");

	ThenObserverWasCalled(mockObserver, 1, "Yep");
});

test("Should work with computed observable", () => {
	const t = new ObservableArray<string>(["Hello", "Amazing", "World"]);
	const c = new Computed<string>(() => t.Value[0]);
	c.Subscribe(mockObserver);

	expect(c.Value).toStrictEqual("Hello");

	t.unshift("What");
	expect(c.Value).toStrictEqual("What");

	ThenObserverWasCalled(mockObserver, 1, "What");
});
