import { ObservableArray } from "../src/ObservableArray";
import { Computed } from "../src/Computed";
import { ThenObserverWasCalled } from "./TestHelpers";

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
	const t = new ObservableArray<string>([]);
	t.Subscribe(mockObserver);

	t.push("Hello");
	ThenObserverWasCalled(mockObserver, 1, ["Hello"]);
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
	const t = new ObservableArray<string>([]);
	t.Subscribe(mockObserver);

	t.unshift("Hello");
	ThenObserverWasCalled(mockObserver, 1, ["Hello"]);
});

test("Should notify observers when value is reversed", () => {
	const t = new ObservableArray<string>(["Hello", "World"]);
	t.Subscribe(mockObserver);

	t.reverse();
	ThenObserverWasCalled(mockObserver, 1, ["World", "Hello"]);
});

test("Should notify observers when value is sorted", () => {
	const t = new ObservableArray<string>(["Hello", "World"]);
	t.Subscribe(mockObserver);

	t.sort(() => -1);
	ThenObserverWasCalled(mockObserver, 1, ["World", "Hello"]);
});

test("Should notify observers when value is spliced", () => {
	const t = new ObservableArray<string>(["Hello", "Amazing", "World"]);
	t.Subscribe(mockObserver);

	const removed = t.splice(1, 1, "Testing");
	expect(removed).toStrictEqual(["Amazing"]);
	ThenObserverWasCalled(mockObserver, 1, ["Hello", "Testing", "World"]);
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
