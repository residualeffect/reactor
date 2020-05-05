import { ObservableObject } from "../src/ObservableObject";
import { Computed } from "../src/Computed";
import { ThenObserverWasCalled, ThenObserverCallCountIs } from "./TestHelpers";

interface NestedObject {
	A: number;
}

interface TestSimpleObject {
	A: string;
	B: boolean;
	C: NestedObject;
}

let mockObserver: jest.Mock;

beforeEach(() => {
	mockObserver = jest.fn();
});

test("Should notify observers on object change", () => {
	const t = new ObservableObject<TestSimpleObject>({ A: "Testing", B: false, C: { A: 3} });
	const unsubscribe = t.Subscribe(mockObserver);

	t.Value = {
		A: "Hello",
		B: true,
		C: { A: 4 },
	};

	ThenObserverWasCalled(mockObserver, 1, { A: "Hello", B: true, C: { A: 4} });

	unsubscribe();

	ThenObserverCallCountIs(mockObserver, 1);
});

test("Should notify observers after changes have been made via Update func", () => {
	const t = new ObservableObject<TestSimpleObject>({ A: "Testing", B: false, C: { A: 3} });
	const unsubscribe = t.Subscribe(mockObserver);

	t.Update(x => { x.C.A = 4; });

	ThenObserverWasCalled(mockObserver, 1, { A: "Testing", B: false, C: { A: 4} });

	unsubscribe();

	ThenObserverCallCountIs(mockObserver, 1);
});

test("Should still notify observers even if no changes are made via Update func", () => {
	const t = new ObservableObject<TestSimpleObject>({ A: "Testing", B: false, C: { A: 3} });
	const unsubscribe = t.Subscribe(mockObserver);

	t.Update(() => { /* DOES NOTHING */ });

	ThenObserverWasCalled(mockObserver, 1, { A: "Testing", B: false, C: { A: 3} });

	unsubscribe();

	ThenObserverCallCountIs(mockObserver, 1);
});

test("Should notify observers after changes have been made via UpdateWhen func", () => {
	const t = new ObservableObject<TestSimpleObject>({ A: "Testing", B: false, C: { A: 3} });
	const unsubscribe = t.Subscribe(mockObserver);

	t.UpdateWhen(x => x.C.A < 4, x => x.C.A = 4);

	ThenObserverWasCalled(mockObserver, 1, { A: "Testing", B: false, C: { A: 4} });

	unsubscribe();

	ThenObserverCallCountIs(mockObserver, 1);
});

test("Should not notify observers if condition is not met during UpdateWhen func", () => {
	const t = new ObservableObject<TestSimpleObject>({ A: "Testing", B: false, C: { A: 3} });
	const unsubscribe = t.Subscribe(mockObserver);

	t.UpdateWhen(x => x.C.A < 3, x => x.C.A = 4);

	ThenObserverCallCountIs(mockObserver, 0);

	unsubscribe();
});

test("Should work with computed observable", () => {
	const t = new ObservableObject<TestSimpleObject>({ A: "Testing", B: false, C: { A: 3} });
	const c = new Computed<string>(() => t.Value.A);
	c.Subscribe(mockObserver);

	expect(c.Value).toStrictEqual("Testing");

	t.Update(x => { x.A = "What is up"; });
	expect(c.Value).toStrictEqual("What is up");

	ThenObserverWasCalled(mockObserver, 1, "What is up");
});
