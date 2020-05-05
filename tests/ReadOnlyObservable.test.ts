import { Observable } from "../src/Observable";
import { Computed } from "../src/Computed";
import { FilteredObservable } from "../src/FilteredObservable";
import { ObservableArray } from "../src/ObservableArray";
import { ObservableObject } from "../src/ObservableObject";
import { ThenObserverWasCalled } from "./TestHelpers";

interface TestObject {
	A: string;
	B: number;
}

let mockObserver: jest.Mock;

beforeEach(() => {
	mockObserver = jest.fn();
});

test("Should allow Observable to be used as generic read-only value", () => {
	const o = new Observable<string>("Hello");
	const r = o.AsReadOnly();

	r.Subscribe(mockObserver);

	expect(r.Value).toStrictEqual("Hello");

	o.Value = "Testing";
	ThenObserverWasCalled(mockObserver, 1, "Testing");
});

test("Should allow Computed to be used as generic read-only value", () => {
	const o = new Observable<string>("Hello");
	const c = new Computed<string>(() => o.Value);
	const r = c.AsReadOnly();

	r.Subscribe(mockObserver);

	expect(r.Value).toStrictEqual("Hello");

	o.Value = "Testing";
	ThenObserverWasCalled(mockObserver, 1, "Testing");
});

test("Should allow FilteredObservable to be used as generic read-only value", () => {
	const o = new FilteredObservable<string>("Hello", (x, s) => s(x + "Hello"));
	const r = o.AsReadOnly();

	r.Subscribe(mockObserver);

	expect(r.Value).toStrictEqual("Hello");

	o.Value = "Testing";
	ThenObserverWasCalled(mockObserver, 1, "TestingHello");
});

test("Should allow ObservableArray to be used as generic read-only value", () => {
	const o = new ObservableArray<string>(["Hello", "World"]);
	const r = o.AsReadOnly();

	r.Subscribe(mockObserver);

	expect(r.Value).toStrictEqual(["Hello", "World"]);

	o.pop();

	ThenObserverWasCalled(mockObserver, 1, ["Hello"]);
});

test("Should allow ObservableObject to be used as generic read-only value", () => {
	const o = new ObservableObject<TestObject>({ A: "Hello", B: 4 });
	const r = o.AsReadOnly();

	r.Subscribe(mockObserver);

	expect(r.Value).toStrictEqual({ A: "Hello", B: 4 });

	o.Update(x => { x.A = "Test"; });

	ThenObserverWasCalled(mockObserver, 1, { A: "Test", B: 4 });
});
