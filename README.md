# reactor

A lightweight reactive programming library for javascript that includes automatic dependency tracking for computed values.

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
const unsubscribe = t.Subscribe((newValue) => console.log(newValue));

// Change value
t.Value = 5;

// Get current value
console.log(t.Value);

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
const unsubscribe = t.Subscribe((newValue) => console.log(newValue));

// Push a new value on to the array
t.push(5);

// Get current value (t is now [3,5])
console.log(t.Value);

// Note that modifying the value is not allowed
t.Value.push(5); // ERROR !!!

// But you can replace the entire array if you want
t.Value = [6];

// Get current value (t is now [6])
console.log(t.Value);

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
const unsubscribe = t.Subscribe((newValue) => console.log(newValue));

// Get current value (Hello / World)
console.log(t.Value);

// Change value
t.Value = { PropertyA: "Testing", PropertyB: "A Lot" };

// Get new value (Testing / A Lot)
console.log(t.Value);

// Note that modifying the value is not allowed
t.Value.PropertyA = "Tricky"; // ERROR !!!

// However, you can apply updates to properties like so
t.Update(x => { x.PropertyA = "Tricky"; });

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
const unsubscribe = c.Subscribe((newValue) => console.log(newValue));

// Get current computed value (c is 6 now)
console.log(c.Value);

// Update the computed by modifying the observable (c is now 10)
t.Value = 5;

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
const unsubscribe = r.Subscribe((newValue) => console.log(newValue));

// Get current value
console.log(r.Value);

// Update the rate limited value
r.Value = 5;
// Current value is still 3
console.log(r.Value);
// Wait 200ms... value is now 5, and the observer was notified
console.log(r.Value);

// Update the rate limited value several times in less than 200ms
r.Value = 6;
r.Value = 7;
// Current value is still 5
console.log(r.Value);
// Wait 200ms... value is now 7, and the observer was notified once
console.log(r.Value);

// Stop observing changes
unsubscribe();
```

# Example Usage with React

This library works well with react hooks (available starting with React 16.8), and can facilitate implementing fully functional, reactive application logic separately from your UI components.

To do this, start by implementing a react hook for using observables:

```ts
import { useEffect, useState } from "react";
import type { BaseObservable } from "@residualeffect/reactor";

export function useObservable<T>(observable: BaseObservable<T>): T {
	const [, triggerReact] = useState({});

	useEffect(() => {
		return observable.Subscribe(() => triggerReact({}));
	}, [observable]);

	return observable.Value;
}
```

Implement your application logic using reactor:

```ts
import { Observable, Computed } from "@residualeffect/reactor";

export const t = new Observable(3);
export const c = new Computed(() => t.Value * 2);

export function DoSomething() {
	t.Value = t.Value + 1;
}
```

And then utilize your application logic in a react component:

```tsx
const ExampleComponent: React.FC = () => {
	const value = useObservable(t);
	const computedValue = useObservable(c);

	return (
		<>
			<div>Value: {value} -- Computed Value: {computedValue}</div>
			<button onClick={DoSomething}>Go</button>
		</>
	);
};
```

# License

reactor is freely distributable under the terms of the [MIT License](LICENSE).