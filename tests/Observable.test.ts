import { Observable } from "../src/Observable";
import { ThenObserverWasCalled, ThenObserverCallCountIs } from "./TestHelpers";

let mockObserver: jest.Mock;
let mockObserverTwo: jest.Mock;
let mockObserverThree: jest.Mock;

beforeEach(() => {
	mockObserver = jest.fn();
	mockObserverTwo = jest.fn();
	mockObserverThree = jest.fn();
});

test("Should have value", () => {
	const t = new Observable(true);

	expect(t.Value).toStrictEqual(true);
});

test("Should allow value to change", () => {
	const t = new Observable(true);

	expect(t.Value).toStrictEqual(true);

	t.Value = false;

	expect(t.Value).toStrictEqual(false);
});

test("Should allow value to be transformed", () => {
	const t = new Observable(true);

	expect(t.Value).toStrictEqual(true);

	t.Update(x => !x);

	expect(t.Value).toStrictEqual(false);
});

test("Should notify observers on change until they unsubscribe", () => {
	const t = new Observable(true);
	const unsubscribe = t.Subscribe(mockObserver);

	t.Value = false;
	ThenObserverWasCalled(mockObserver, 1, false);

	unsubscribe();

	t.Value = true;

	ThenObserverCallCountIs(mockObserver, 1);
});

test("Should notify all observers on change until they unsubscribe", () => {
	const t = new Observable(true);
	const unsubscribe = t.Subscribe(mockObserver);
	const unsubscribeTwo = t.Subscribe(mockObserverTwo);

	t.Value = false;
	ThenObserverWasCalled(mockObserver, 1, false);
	ThenObserverWasCalled(mockObserverTwo, 1, false);

	unsubscribeTwo();

	t.Value = true;

	ThenObserverWasCalled(mockObserver, 2, true);
	ThenObserverCallCountIs(mockObserverTwo, 1);

	unsubscribe();

	t.Value = false;

	ThenObserverCallCountIs(mockObserver, 2);
	ThenObserverCallCountIs(mockObserverTwo, 1);

	const unsubscribeThree = t.Subscribe(mockObserverThree);

	t.Value = true;

	ThenObserverCallCountIs(mockObserver, 2);
	ThenObserverCallCountIs(mockObserverTwo, 1);
	ThenObserverWasCalled(mockObserverThree, 1, true);

	unsubscribeThree();

	t.Value = false;

	ThenObserverCallCountIs(mockObserver, 2);
	ThenObserverCallCountIs(mockObserverTwo, 1);
	ThenObserverCallCountIs(mockObserverThree, 1);
});

test("Should not notify subscribers when value doesn't change", () => {
	const t = new Observable(true);
	t.Subscribe(mockObserver);

	t.Value = true;

	ThenObserverCallCountIs(mockObserver, 0);
});

test("Should deal with observer being removed multiple times", () => {
	const t = new Observable(true);

	const unsubscribe = t.Subscribe(mockObserver);

	expect(t.Value).toStrictEqual(true);

	t.Value = false;

	ThenObserverWasCalled(mockObserver, 1, false);

	unsubscribe();
	unsubscribe();

	t.Value = true;

	ThenObserverCallCountIs(mockObserver, 1);
});
