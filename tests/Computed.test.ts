import { Observable } from "../src/Observable";
import { Computed } from "../src/Computed";
import { ThenObserverCallCountIs, ThenObserverWasCalled } from "./TestHelpers";
import { IsTracking } from "../src/DependencyTracking";
import { ObservableArray } from "../src/ObservableArray";

let mockObserver: jest.Mock;

beforeEach(() => {
	mockObserver = jest.fn();
});

test("Should compute value", () => {
	const t = new Observable(true);
	const c = new Computed(() => !t.Value);

	expect(t.Value).toStrictEqual(true);
	expect(c.Value).toStrictEqual(false);

	t.Value = false;

	expect(t.Value).toStrictEqual(false);
	expect(c.Value).toStrictEqual(true);
});

test("Should be able to generate static value", () => {
	const c = new Computed(() => 3);

	expect(c.Value).toStrictEqual(3);
});

test("Should compute value and notify subscribers until they stop observing", () => {
	const t = new Observable(true);
	const c = new Computed(() => !t.Value);

	expect(c.ActiveDependencyCount).toStrictEqual(0);

	const unsubscribe = c.Subscribe(mockObserver);

	expect(c.ActiveDependencyCount).toStrictEqual(1);

	expect(t.Value).toStrictEqual(true);
	expect(c.Value).toStrictEqual(false);

	ThenObserverCallCountIs(mockObserver, 0);

	t.Value = false;

	expect(t.Value).toStrictEqual(false);
	expect(c.Value).toStrictEqual(true);

	ThenObserverWasCalled(mockObserver, 1, true);

	expect(c.ActiveDependencyCount).toStrictEqual(1);

	unsubscribe();

	expect(c.ActiveDependencyCount).toStrictEqual(0);

	t.Value = true;

	expect(t.Value).toStrictEqual(true);
	expect(c.Value).toStrictEqual(false);

	ThenObserverCallCountIs(mockObserver, 1);
});

test("Should re-calculate value when dependency is updated", () => {
	const t = new Observable(12);
	const u = new Observable(3);
	const c = new Computed(() => {
		if (t.Value > 10) {
			return t.Value * u.Value;
		}

		return t.Value;
	});

	c.Subscribe(mockObserver);

	u.Value = 4;

	expect(t.Value).toStrictEqual(12);
	expect(u.Value).toStrictEqual(4);
	expect(c.Value).toStrictEqual(48);
	expect(c.DependencyCount).toStrictEqual(2);

	ThenObserverWasCalled(mockObserver, 1, 48);
});

test("Should not update twice when using the same dependency twice", () => {
	const t = new Observable(12);
	const c = new Computed(() => t.Value * t.Value);

	c.Subscribe(mockObserver);

	t.Value = 4;

	expect(t.Value).toStrictEqual(4);
	expect(c.Value).toStrictEqual(16);
	expect(c.DependencyCount).toStrictEqual(1);

	ThenObserverWasCalled(mockObserver, 1, 16);
});

test("Should not re-calculate value when dependency is updated to same value", () => {
	const t = new Observable(12);
	const u = new Observable(3);
	const c = new Computed(() => {
		if (t.Value > 10) {
			return t.Value * u.Value;
		}

		return t.Value;
	});

	c.Subscribe(mockObserver);

	u.Value = 3;

	expect(t.Value).toStrictEqual(12);
	expect(u.Value).toStrictEqual(3);
	expect(c.Value).toStrictEqual(36);

	ThenObserverCallCountIs(mockObserver, 0);
});

test("Should not re-calculate value when currently unused dependency is updated", () => {
	const t = new Observable(10);
	const u = new Observable(3);
	const c = new Computed(() => {
		if (t.Value > 10) {
			return t.Value * u.Value;
		}

		return t.Value;
	});

	c.Subscribe(mockObserver);

	u.Value = 4;

	expect(t.Value).toStrictEqual(10);
	expect(u.Value).toStrictEqual(4);
	expect(c.Value).toStrictEqual(10);

	ThenObserverCallCountIs(mockObserver, 0);
});

test("Should identify when dependency starts being used and re-calculate value when it is modified", () => {
	const t = new Observable(10);
	const u = new Observable(3);
	const c = new Computed(() => {
		if (t.Value > 10) {
			return t.Value * u.Value;
		}

		return t.Value;
	});

	expect(c.DependencyCount).toStrictEqual(1);

	c.Subscribe(mockObserver);

	u.Value = 4;
	expect(c.DependencyCount).toStrictEqual(1);

	expect(t.Value).toStrictEqual(10);
	expect(u.Value).toStrictEqual(4);
	expect(c.Value).toStrictEqual(10);

	ThenObserverCallCountIs(mockObserver, 0);

	t.Value = 12;
	expect(c.DependencyCount).toStrictEqual(2);

	expect(t.Value).toStrictEqual(12);
	expect(u.Value).toStrictEqual(4);
	expect(c.Value).toStrictEqual(48);

	ThenObserverWasCalled(mockObserver, 1, 48);

	u.Value = 5;

	expect(t.Value).toStrictEqual(12);
	expect(u.Value).toStrictEqual(5);
	expect(c.Value).toStrictEqual(60);

	ThenObserverWasCalled(mockObserver, 2, 60);
});

test("Should identify when dependency stops being used and not re-calculate value when it is modified", () => {
	const t = new Observable(12);
	const u = new Observable(3);
	const c = new Computed(() => {
		if (t.Value > 10) {
			return t.Value * u.Value;
		}

		return t.Value;
	});

	c.Subscribe(mockObserver);

	u.Value = 4;
	expect(c.DependencyCount).toStrictEqual(2);

	expect(t.Value).toStrictEqual(12);
	expect(u.Value).toStrictEqual(4);
	expect(c.Value).toStrictEqual(48);

	ThenObserverWasCalled(mockObserver, 1, 48);

	t.Value = 5;
	expect(c.DependencyCount).toStrictEqual(1);

	expect(t.Value).toStrictEqual(5);
	expect(u.Value).toStrictEqual(4);
	expect(c.Value).toStrictEqual(5);

	ThenObserverWasCalled(mockObserver, 2, 5);

	u.Value = 5;

	expect(t.Value).toStrictEqual(5);
	expect(u.Value).toStrictEqual(5);
	expect(c.Value).toStrictEqual(5);

	ThenObserverCallCountIs(mockObserver, 2);
});

test("Should be able to generate a computed using another computed", () => {
	const t = new Observable(12);
	const c = new Computed(() => t.Value + 10);
	const d = new Computed(() => c.Value + 20);

	expect(t.Value).toStrictEqual(12);
	expect(c.Value).toStrictEqual(22);
	expect(d.Value).toStrictEqual(42);

	const unsubscribe = d.Subscribe(mockObserver);

	expect(d.DependencyCount).toStrictEqual(1);
	expect(c.DependencyCount).toStrictEqual(1);

	t.Value = 4;

	expect(t.Value).toStrictEqual(4);
	expect(c.Value).toStrictEqual(14);
	expect(d.Value).toStrictEqual(34);

	ThenObserverWasCalled(mockObserver, 1, 34);

	unsubscribe();

	t.Value = 5;

	expect(t.Value).toStrictEqual(5);
	expect(c.Value).toStrictEqual(15);
	expect(d.Value).toStrictEqual(35);

	ThenObserverCallCountIs(mockObserver, 1);
});

test("Should be able to observe a computed that uses a computed that has no dependencies", () => {
	const c = new Computed<number[]>(() => []);
	const d = new Computed(() => c.Value.length > 0);

	d.Subscribe(mockObserver);

	expect(d.Value).toStrictEqual(false);
	ThenObserverCallCountIs(mockObserver, 0);
});

test("Should handle value generators that sometimes throw errors", () => {
	const shouldFail = new Observable(false);
	const valueGenerator = (): number => {
		if (shouldFail.Value) {
			throw new Error("TEST ERROR MESSAGE");
		}
		return 3;
	};

	const c = new Computed(valueGenerator);
	c.Subscribe(mockObserver);

	expect(c.Value).toStrictEqual(3);

	const action = (): void => {
		shouldFail.Value = true;
	};

	const expectedErrorMessage = `An error occurred while generating a computed value.  Value Generator:

${valueGenerator.toString()}

The error was: TEST ERROR MESSAGE`;

	expect(action).toThrow(new Error(expectedErrorMessage));

	expect(IsTracking()).toStrictEqual(false);
});

test("Should track large dependency chains", () => {
	const dependencyChain: Computed<number>[] = [];

	const t = new Observable(3);
	const firstDependency = new Computed(() => t.Value * 2);
	dependencyChain[0] = firstDependency;

	for (let i = 1; i < 1000; i++) {
		dependencyChain[i] = new Computed(() => dependencyChain[i-1].Value + i);
		dependencyChain[i].Subscribe(jest.fn());
	}

	const lastDependency = dependencyChain[999];

	expect(lastDependency.Value).toStrictEqual(499506);

	t.Value = 4;

	expect(lastDependency.Value).toStrictEqual(499508);
});

test("Should track large sets of dependencies", () => {
	const manyObservables: Observable<number>[] = [];
	for (let i = 0; i < 1000; i++) {
		manyObservables[i] = new Observable(i);
		manyObservables[i].Subscribe(jest.fn());
	}

	const c = new Computed(() => {
		let result = 0;
		for (let i = 0; i < 1000; i++) {
			result += manyObservables[i].Value;
		}
		return result;
	});

	expect(c.Value).toStrictEqual(499500);
	expect(c.DependencyCount).toStrictEqual(1000);

	manyObservables[0].Value = 50;

	expect(c.Value).toStrictEqual(499550);
	expect(c.DependencyCount).toStrictEqual(1000);
});

test("Should handle same dependency many times", () => {
	const t = new Observable(3);

	const myComputed: Computed<number> = new Computed(() => {
		let result = 0;
		for (let i = 0; i < 1000; i++) {
			result += t.Value;
		}
		return result;
	});

	expect(myComputed.Value).toStrictEqual(3000);
	expect(myComputed.DependencyCount).toStrictEqual(1);

	t.Value = 4;
	expect(myComputed.Value).toStrictEqual(4000);
	expect(myComputed.DependencyCount).toStrictEqual(1);
});

test("Should handle large number of subscribers", () => {
	const t = new Observable(3);

	const manyComputed: Computed<number>[] = [];
	for (let i = 0; i < 1000; i++) {
		manyComputed[i] = new Computed(() => t.Value + i);
	}

	t.Value = 4;

	for (let i = 0; i < 1000; i++) {
		expect(manyComputed[i].Value).toStrictEqual(4 + i);
	}
});

test("Should be usable as a ReadOnlyObservable", () => {
	const t = new Observable(true);
	const c = new Computed(() => !t.Value);
	const ro = c.AsReadOnly();
	expect(ro.Value).toStrictEqual(false);
});

test("Should notify observers whenever the new value is detected as different - object types are never equal by default", () => {
	const t1 = new ObservableArray<number>([]);
	const t2 = new Observable<boolean>(false);
	const c1 = new Computed(() => t1.Value.map(x => x * 2));
	const c2 = new Computed(() => t2.Value ? c1.Value.map(x => x) : [1]);
	const unsubscribe = c2.Subscribe(mockObserver);

	expect(c2.Value).toStrictEqual([1]);

	t1.push(3);
	ThenObserverCallCountIs(mockObserver, 0);

	t2.Value = true;
	ThenObserverWasCalled(mockObserver, 1, [6]);

	t1.Value = [3];
	ThenObserverWasCalled(mockObserver, 2, [6]);

	unsubscribe();
});

test("Should detect that a new value is the same as the existing value using a custom equality comparison function", () => {
	const t1 = new ObservableArray<number>([]);
	const t2 = new Observable<boolean>(false);
	const c1 = new Computed(() => t1.Value.map(x => x * 2));
	const c2 = new Computed(() => t2.Value ? c1.Value.map(x => x) : [1], (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, idx) => x === b[idx]));
	const unsubscribe = c2.Subscribe(mockObserver);

	expect(c2.Value).toStrictEqual([1]);

	t1.push(3);
	ThenObserverCallCountIs(mockObserver, 0);

	t2.Value = true;
	ThenObserverWasCalled(mockObserver, 1, [6]);

	t1.Value = [3];
	ThenObserverWasCalled(mockObserver, 1, [6]);

	unsubscribe();
});
