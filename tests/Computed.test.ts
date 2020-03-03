import { Observable } from "../src/Observable";
import { Computed } from "../src/Computed";
import { IsTracking } from "../src/DependencyTracking";
import { ThenObserverCallCountIs, ThenObserverWasCalled } from "./TestHelpers";

let mockObserver: jest.Mock;

beforeEach(() => {
	mockObserver = jest.fn();
});

test("Should compute value", () => {
	const t = new Observable(true);
	const c = new Computed(() => !t.Value);

	expect(t.Value).toBe(true);
	expect(c.Value).toBe(false);

	t.Value = false;

	expect(t.Value).toBe(false);
	expect(c.Value).toBe(true);
});

test("Should be able to generate static value", () => {
	const c = new Computed(() => 3);

	expect(c.Value).toBe(3);
});

test("Should compute value and notify subscribers until they stop", () => {
	const t = new Observable(true);
	const c = new Computed(() => !t.Value);

	const unsubscribe = c.Subscribe(mockObserver);

	expect(t.Value).toBe(true);
	expect(c.Value).toBe(false);

	ThenObserverCallCountIs(mockObserver, 0);

	t.Value = false;

	expect(t.Value).toBe(false);
	expect(c.Value).toBe(true);

	ThenObserverWasCalled(mockObserver, 1, true, false);

	unsubscribe();

	t.Value = true;

	expect(t.Value).toBe(true);
	expect(c.Value).toBe(false);

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

	expect(t.Value).toBe(12);
	expect(u.Value).toBe(4);
	expect(c.Value).toBe(48);
	expect(c.DependencyCount).toBe(2);

	ThenObserverWasCalled(mockObserver, 1, 48, 36);
});

test("Should not update twice when using the same dependency twice", () => {
	const t = new Observable(12);
	const c = new Computed(() => t.Value * t.Value);

	c.Subscribe(mockObserver);

	t.Value = 4;

	expect(t.Value).toBe(4);
	expect(c.Value).toBe(16);
	expect(c.DependencyCount).toBe(1);

	ThenObserverWasCalled(mockObserver, 1, 16, 144);
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

	expect(t.Value).toBe(12);
	expect(u.Value).toBe(3);
	expect(c.Value).toBe(36);

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

	expect(t.Value).toBe(10);
	expect(u.Value).toBe(4);
	expect(c.Value).toBe(10);

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

	expect(c.DependencyCount).toBe(0);

	c.Subscribe(mockObserver);

	u.Value = 4;
	expect(c.DependencyCount).toBe(1);

	expect(t.Value).toBe(10);
	expect(u.Value).toBe(4);
	expect(c.Value).toBe(10);

	ThenObserverCallCountIs(mockObserver, 0);

	t.Value = 12;
	expect(c.DependencyCount).toBe(2);

	expect(t.Value).toBe(12);
	expect(u.Value).toBe(4);
	expect(c.Value).toBe(48);

	ThenObserverWasCalled(mockObserver, 1, 48, 10);

	u.Value = 5;

	expect(t.Value).toBe(12);
	expect(u.Value).toBe(5);
	expect(c.Value).toBe(60);

	ThenObserverWasCalled(mockObserver, 2, 60, 48);
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
	expect(c.DependencyCount).toBe(2);

	expect(t.Value).toBe(12);
	expect(u.Value).toBe(4);
	expect(c.Value).toBe(48);

	ThenObserverWasCalled(mockObserver, 1, 48, 36);

	t.Value = 5;
	expect(c.DependencyCount).toBe(1);

	expect(t.Value).toBe(5);
	expect(u.Value).toBe(4);
	expect(c.Value).toBe(5);

	ThenObserverWasCalled(mockObserver, 2, 5, 48);

	u.Value = 5;

	expect(t.Value).toBe(5);
	expect(u.Value).toBe(5);
	expect(c.Value).toBe(5);

	ThenObserverCallCountIs(mockObserver, 2);
});

test("Should be able to generate a computed using another computed", () => {
	const t = new Observable(12);
	const c = new Computed(() => t.Value + 10);
	const d = new Computed(() => c.Value + 20);

	expect(t.Value).toBe(12);
	expect(c.Value).toBe(22);
	expect(d.Value).toBe(42);

	const unsubscribe = d.Subscribe(mockObserver);

	expect(d.DependencyCount).toBe(1);
	expect(c.DependencyCount).toBe(1);

	t.Value = 4;

	expect(t.Value).toBe(4);
	expect(c.Value).toBe(14);
	expect(d.Value).toBe(34);

	ThenObserverWasCalled(mockObserver, 1, 34, 42);

	unsubscribe();

	t.Value = 5;

	expect(t.Value).toBe(5);
	expect(c.Value).toBe(15);
	expect(d.Value).toBe(35);

	ThenObserverCallCountIs(mockObserver, 1);
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

	expect(lastDependency.Value).toBe(499506);

	t.Value = 4;

	expect(lastDependency.Value).toBe(499508);
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

	expect(c.Value).toBe(499500);

	manyObservables[0].Value = 50;

	expect(c.Value).toBe(499550);
});

test("Should handle large number of subscribers", () => {
	const t = new Observable(3);

	const manyComputed: Computed<number>[] = [];
	for (let i = 0; i < 1000; i++) {
		manyComputed[i] = new Computed(() => t.Value + i);
	}

	t.Value = 4;

	for (let i = 0; i < 1000; i++) {
		expect(manyComputed[i].Value).toBe(4 + i);
	}
});

describe("Should handle errors gracefully", () => {
	test("Should handle value generators that sometimes throw errors", () => {
		let shouldFail = false;
		const valueGenerator = (): number => {
			if (shouldFail) {
				throw new Error("TEST ERROR MESSAGE");
			}
			return 3;
		};
		const c = new Computed(valueGenerator);
	
		shouldFail = true;
	
		const action = (): void => {
			c.Value;
		};
	
		const expectedErrorMessage = `An error occurred while generating a computed value.  Value Generator:

${valueGenerator}

The error was: TEST ERROR MESSAGE`;
	
		expect(action).toThrow(new Error(expectedErrorMessage));
	
		expect(IsTracking()).toBe(false);
	});
	
	test("Should handle value generators that sometimes throw string errors", () => {
		let shouldFail = false;
		const valueGenerator = (): number => {
			if (shouldFail) {
				throw "STRING ERROR MESSAGE";
			}
			return 3;
		};
		const c = new Computed(valueGenerator);
	
		shouldFail = true;
	
		const action = (): void => {
			c.Value;
		};
	
		const expectedErrorMessage = `An error occurred while generating a computed value.  Value Generator:

${valueGenerator}

The error was: STRING ERROR MESSAGE`;
	
		expect(action).toThrow(new Error(expectedErrorMessage));
	
		expect(IsTracking()).toBe(false);

		shouldFail = false;

		expect(c.Value).toBe(3);
	});

	test("Should detect computed value generators that depend on themselves", () => {
		let c: Computed<number> = new Computed(() => 3);
		const valueGenerator = (): number => c.Value + 3;
		c = new Computed(valueGenerator);
	
		const action = (): void => {
			c.Value;
		};
	
		const expectedErrorMessage = `An error occurred while generating a computed value.  Value Generator:

${valueGenerator}

The error was: Circular dependency detected!`;
	
		expect(action).toThrow(new Error(expectedErrorMessage));
	});
	
	
	test("Should detect computed value generators that indirectly depend on themselves", () => {
		let e = new Computed(() => 4);
	
		const outerValueGenerator = (): number => e.Value;
		const d = new Computed(outerValueGenerator);
	
		const innerValueGenerator = (): number => d.Value;
		e = new Computed(innerValueGenerator);
	
		const action = (): void => {
			e.Value;
		};
	
		const expectedErrorMessage = `An error occurred while generating a computed value.  Value Generator:

${innerValueGenerator}

Nested Value Generator (depth 1):

${outerValueGenerator}

Nested error (depth 1): Circular dependency detected!`;
	
		expect(action).toThrow(new Error(expectedErrorMessage));
	});
	
	test("Should detect circular dependencies for value generates that modify dependencies", () => {
		const t = new Observable(3);
		const valueGenerator = (): number => {
			t.Value = t.Value * 2;
	
			return t.Value;
		};
		const c = new Computed(valueGenerator);
	
		c.Subscribe(mockObserver);
	
		const action = (): void => {
			t.Value = 8;
		};
	
		const expectedErrorMessage = `An error occurred while generating a computed value.  Value Generator:

${valueGenerator}

The error was: Circular dependency detected!`;
	
		expect(action).toThrow(new Error(expectedErrorMessage));
	});
});
