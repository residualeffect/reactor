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

## Rate-Limited Observables

Rate-limited observables are similar to standard observables except they will only notify subscribers after a given period of time has elapsed since the last change.

These offer two modes: Debounce, and Throttle.  Debounce will notify subscribers x milliseconds after the last change, where as Throttle will notify subscribers at most x milliseconds since the first change that was made since the last notification.

```ts
import { RateLimitedObservable, RateLimitType } from "@residualeffect/reactor";

// Create a rate limited observable
const r = new RateLimitedObservable(3, RateLimitType.Debounce, 200);

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
import type { ReadOnlyObservable } from "@residualeffect/reactor";

export function useObservable<T>(observable: ReadOnlyObservable<T>): T {
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
	t.Update(oldValue => oldValue + 1);
}
```

And then utilize your application logic in a react component:

```tsx
const ExampleComponent: React.FC = () => {
	const value = useAnObservable(t);
	const computedValue = useAnObservable(c);

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