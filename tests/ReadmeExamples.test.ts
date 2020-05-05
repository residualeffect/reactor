import { Observable, Computed, ObservableArray, ObservableObject, FilteredObservable, RateLimiter, RateLimitType, ReadOnlyObservable } from "../src";

interface SomeType {
	PropertyA: string;
	PropertyB: string;
}

let observerFunc: jest.Mock;

jest.useFakeTimers();

beforeEach(() => {
	observerFunc = jest.fn();
});

test("README: Observable", () => {
	// Create an observable
	const t = new Observable(3);

	// Observe changes
	const unsubscribe = t.Subscribe(observerFunc);

	// Change value
	t.Value = 5;

	// Get current value
	expect(t.Value).toStrictEqual(5);

	// Stop observing changes
	unsubscribe();
});

test("README: ObservableArray", () => {
	// Create an observable array
	const t = new ObservableArray<number>([3]);

	// Observe changes
	const unsubscribe = t.Subscribe(observerFunc);

	// Push a new value on to the array
	t.push(5);

	// Get current value (it is now [3,5])
	expect(t.Value).toStrictEqual([3, 5]);

	// Note that modifying the value is not allowed
	// t.Value.push(5); // ERROR !!!

	// But you can replace the entire array if you want
	t.Value = [6];

	// Get current value (t is now [6])
	expect(t.Value).toStrictEqual([6]);

	// Stop observing changes
	unsubscribe();
});

test("README: ObservableObject", () => {
	// Create an observable object
	const t = new ObservableObject<SomeType>({ PropertyA: "Hello", PropertyB: "World" });
	
	// Observe changes
	const unsubscribe = t.Subscribe(observerFunc);
	
	// Get current value (Hello / World)
	expect(t.Value).toStrictEqual({ PropertyA: "Hello", PropertyB: "World" });
	
	// Change value
	t.Value = { PropertyA: "Testing", PropertyB: "A Lot" };
	
	// Get new value (Testing / A Lot)
	expect(t.Value).toStrictEqual({ PropertyA: "Testing", PropertyB: "A Lot" });
	
	// Note that modifying the value is not allowed
	// t.Value.PropertyA = "Tricky"; // ERROR !!!
	
	// However, you can apply updates to properties like so
	t.Update(x => { x.PropertyA = "Tricky"; });

	// Get new value (Tricky / A Lot)
	expect(t.Value).toStrictEqual({ PropertyA: "Tricky", PropertyB: "A Lot" });
	
	// Stop observing changes
	unsubscribe();
});

test("README: Computed", () => {
	// Create an observable
	const t = new Observable(3);

	// Create a computed observable (which depends on observable t)
	const c = new Computed(() => t.Value * 2);

	// Observe changes to computed
	const unsubscribe = c.Subscribe(observerFunc);

	// Get current computed value (c is 6 now)
	expect(c.Value).toStrictEqual(6);

	// Update the computed by modifying the observable (c is now 10)
	t.Value = 5;

	// Get current computed value (c is 10 now)
	expect(c.Value).toStrictEqual(10);

	// Stop observing changes to the computed
	unsubscribe();
});

test("README: FilteredObservable", () => {
	// Create a rate limited observable
	const r = new FilteredObservable(3, RateLimiter(RateLimitType.Debounce, 200));

	// Observe changes
	const unsubscribe = r.Subscribe(observerFunc);

	// Get current value
	expect(r.Value).toStrictEqual(3);

	// Update the rate limited value
	r.Value = 5;
	// Current value is still 3
	expect(r.Value).toStrictEqual(3);
	// Wait 200ms... value is now 5, and the observer was notified
	jest.advanceTimersByTime(200);
	expect(r.Value).toStrictEqual(5);

	// Update the rate limited value several times in less than 200ms
	r.Value = 6;
	r.Value = 7;
	// Current value is still 5
	expect(r.Value).toStrictEqual(5);
	// Wait 200ms... value is now 7, and the observer was notified once
	jest.advanceTimersByTime(200);
	expect(r.Value).toStrictEqual(7);

	// Stop observing changes
	unsubscribe();
});

test("README: ReadOnlyObservable", () => {
	// Create an observable
	const t = new Observable(3);

	// Create a computed observable (which depends on observable t)
	const c = new Computed(() => t.Value * 2);

	// Make it read-only
	const rt = t.AsReadOnly();
	const rc = c.AsReadOnly();

	// ... later on ...

	function IsBig(input: ReadOnlyObservable<number>): boolean {
		return input.Value > 5;
	}

	// Transform current value of readonly observable (result false)
	expect(IsBig(rt)).toStrictEqual(false);

	// Transform current value of readonly computed (result true)
	expect(IsBig(rc)).toStrictEqual(true);
});
