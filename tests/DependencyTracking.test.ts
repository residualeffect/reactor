import { Observable } from "../src/Observable";
import { Computed } from "../src/Computed";
import { IsTracking } from "../src/DependencyTracking";

let mockObserver: jest.Mock;

beforeEach(() => {
	mockObserver = jest.fn();
});

test("Should handle value generators that sometimes throw Errors", () => {
	const shouldFail = new Observable(false);
	const badValueGenerator = (): number => {
		if (shouldFail.Value) {
			throw new Error("Something bad happened");
		}
		return 5;
	};
	const x = new Computed(badValueGenerator);

	const goodValueGenerator = (): number => {
		if (shouldFail.Value) {
			return x.Value;
		}
		return 2;
	};
	const c = new Computed(goodValueGenerator);

	c.Subscribe(mockObserver);

	const action = (): void => {
		shouldFail.Value = true;
	};

	const expectedErrorMessage = `An error occurred while generating a computed value.  Value Generator:

${goodValueGenerator.toString()}

Nested Value Generator (depth 1):

${badValueGenerator.toString()}

Nested error (depth 1): Something bad happened`;

	expect(action).toThrow(new Error(expectedErrorMessage));

	expect(IsTracking()).toStrictEqual(false);

	expect(shouldFail.Value).toStrictEqual(true);

	expect(c.Value).toStrictEqual(2);
});

test("Should handle value generators that sometimes throw string errors", () => {
	const shouldFail = new Observable(false);
	const valueGenerator = (): number => {
		if (shouldFail.Value) {
			throw "STRING ERROR MESSAGE";
		}
		return 3;
	};
	const c = new Computed(valueGenerator);
	c.Subscribe(mockObserver);

	const action = (): void => {
		shouldFail.Value = true;
	};

	const expectedErrorMessage = `An error occurred while generating a computed value.  Value Generator:

${valueGenerator.toString()}

The error was: STRING ERROR MESSAGE`;

	expect(action).toThrow(new Error(expectedErrorMessage));

	expect(IsTracking()).toStrictEqual(false);

	expect(shouldFail.Value).toStrictEqual(true);

	expect(c.Value).toStrictEqual(3);
});

test("Should handle value generators that sometimes throw null errors", () => {
	const shouldFail = new Observable(false);
	const valueGenerator = (): number => {
		if (shouldFail.Value) {
			throw null;
		}
		return 3;
	};
	const c = new Computed(valueGenerator);
	c.Subscribe(mockObserver);

	const action = (): void => {
		shouldFail.Value = true;
	};

	const expectedErrorMessage = `An error occurred while generating a computed value.  Value Generator:

${valueGenerator.toString()}

The error was: null`;

	expect(action).toThrow(new Error(expectedErrorMessage));

	expect(IsTracking()).toStrictEqual(false);

	expect(shouldFail.Value).toStrictEqual(true);

	expect(c.Value).toStrictEqual(3);
});

test("Should handle value generators that sometimes throw undefined errors", () => {
	const shouldFail = new Observable(false);
	const valueGenerator = (): number => {
		if (shouldFail.Value) {
			throw undefined;
		}
		return 3;
	};
	const c = new Computed(valueGenerator);
	c.Subscribe(mockObserver);

	const action = (): void => {
		shouldFail.Value = true;
	};

	const expectedErrorMessage = `An error occurred while generating a computed value.  Value Generator:

${valueGenerator.toString()}`;

	expect(action).toThrow(new Error(expectedErrorMessage));

	expect(IsTracking()).toStrictEqual(false);

	expect(shouldFail.Value).toStrictEqual(true);

	expect(c.Value).toStrictEqual(3);
});

test("Should detect computed value generators that depend on themselves", () => {
	const target = new Observable<Computed<number>|undefined>(undefined);

	const valueGenerator = (): number => {
		if (target.Value !== undefined) {
			return target.Value.Value + 6;
		}

		return 3;
	};
	const c = new Computed(valueGenerator);

	const action = (): void => {
		target.Value = c;
		c.Value;
	};

	const expectedErrorMessage = `An error occurred while generating a computed value.  Value Generator:

${valueGenerator.toString()}

The error was: Circular dependency detected!`;

	expect(action).toThrow(new Error(expectedErrorMessage));
});

test("Should detect computed value generators that depend on themselves, even when computed value is being observed", () => {
	const target = new Observable<Computed<number>|undefined>(undefined);

	const valueGenerator = (): number => {
		if (target.Value !== undefined) {
			return target.Value.Value + 6;
		}

		return 3;
	};
	const c = new Computed(valueGenerator);
	target.Value = c;
	c.Subscribe(mockObserver);

	const action = (): void => {
		target.Value = undefined;
	};

	const expectedErrorMessage = `An error occurred while generating a computed value.  Value Generator:

${valueGenerator.toString()}

The error was: Circular dependency detected!`;

	expect(action).toThrow(new Error(expectedErrorMessage));
});

test("Should detect computed value generators that indirectly depend on themselves", () => {
	const target = new Observable<Computed<number>|undefined>(undefined);

	const outerValueGenerator = (): number => {
		if (target.Value) {
			return target.Value.Value * 2;
		}

		return -1;
	};
	const d = new Computed(outerValueGenerator);

	const innerValueGenerator = (): number => {
		return d.Value * 3;
	};
	const e = new Computed(innerValueGenerator);

	const action = (): void => {
		target.Value = e;
		e.Value;
	};

	const expectedErrorMessage = `An error occurred while generating a computed value.  Value Generator:

${innerValueGenerator.toString()}

Nested Value Generator (depth 1):

${outerValueGenerator.toString()}

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

${valueGenerator.toString()}

The error was: Circular dependency detected!`;

	expect(action).toThrow(new Error(expectedErrorMessage));
});
