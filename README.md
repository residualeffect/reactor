# reactor

A lightweight reactive programming library for javascript that includes automatic dependency tracking for computed values.

![Node.js CI](https://github.com/residualeffect/reactor/workflows/Node.js%20CI/badge.svg?branch=master)

[Changelog](CHANGELOG.md)

# Installation

Installation can be accomplished using npm:

`npm install @residualeffect/reactor`

# Documentation

## Observables

A basic observable is the foundation of this library.

```ts
import { Observable } from "@residualeffect/reactor";

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
```

## Observable arrays

A basic observable works just fine for simple types, but when working with an array, mutations to the array require you to modify and the re-set the observable value.  ObservableArrays simplify this by providing data modification capabilities that notify subscribers.

```ts
import { ObservableArray } from "@residualeffect/reactor";

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
```

## Observable objects

When using an observable for a complex object, you need to be careful to prevent unexpected modification to properties within the object.  ObservableObject can help this by carefully controlling when modifications are allowed and making sure observers are appropriately notified.

```ts
import { ObservableObject } from "@residualeffect/reactor";

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
```

## Computed Observables

Computed observables are values that are automatically generated when other observable values change.  This library includes automatic dependency tracking for the computed observables you define.

```ts
import { Observable, Computed } from "@residualeffect/reactor";

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
```

## Filtering Updates to Observables

Sometimes it is useful to filter updates to observables - for example, by limiting the rate at which the observable will modify and notify subscribers.

This library includes the ability to limit the rate of updates using a FilteredObservable with two modes of operation: Debounce, and Throttle.  Debounce will notify subscribers x milliseconds after the last change, whereas Throttle will notify subscribers at most x milliseconds after the first change that was made to the value since the last notification.

```ts
import { FilteredObservable, RateLimiter, RateLimitType } from "@residualeffect/reactor";

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
```

## Read-Only Observables

Observables of various types can all be converted in to a ReadOnlyObservable, which provides only read-only access to the observable value and the ability to subscribe, but no other capabilities.  These are helpful when you need to be able to interchangeably use different types of observables for a function call.

```ts
import { Observable, Computed, ReadOnlyObservable } from "@residualeffect/reactor";

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

// Or convert it to a read-only instance that is compatible with other observable types
const r = t.AsReadOnly(); // r is of type ReadOnlyObservable<number>, which can only get the value or subscribe to changes
```

## Custom equality comparison

By default, reactor will do it's best to quickly determine if a value has changed before notifying subscribers.  The default implementation is primitive, and tends to over-detect changes rather than under-detect them -- especially when working with arrays and objects.

In some cases it may make sense to provide a custom equality comparison function to reactor, so that it can more intelligently notify subscribers of changes.

```ts
import { Observable } from "@residualeffect/reactor";

// Create an observable with a custom equality comparison function
const t = new Observable({ id: 3 }, (a, b) => a.id === b.id);

// Observe changes
const unsubscribe = t.Subscribe(observerFunc);

// Change value with a new object that is "equivalent"
t.Value = { id: 3 };

// Subscriber was NOT notified
// The default equality comparison would have notified here...

// Change value with a new object that is not "equivalent"
t.Value = { id: 4 };

// Subscriber was notified!

// Stop observing changes
unsubscribe();
```

# Using Reactor with React

This library works well with react hooks (available starting with React 16.8), and can facilitate implementing fully functional, reactive application logic separately from your UI components.

Take advantage of [@residualeffect/rereactor](https://github.com/residualeffect/rereactor) or create your own!

# License

reactor is freely distributable under the terms of the [MIT License](LICENSE).
