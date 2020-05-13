import type { ValueFilter } from "./FilteredObservable";

export enum RateLimitType {
	Debounce,
	Throttle
}

export function RateLimiter<T>(type: RateLimitType, delay: number): ValueFilter<T> {
	let timeoutId: ReturnType<typeof setTimeout>|undefined = undefined;
	let pendingValue: T;

	return (newValue: T, setValue: (newValue: T) => void): void => {
		pendingValue = newValue;

		if (type === RateLimitType.Debounce && timeoutId !== undefined) {
			clearTimeout(timeoutId);
			timeoutId = undefined;
		}

		if (timeoutId === undefined) {
			timeoutId = setTimeout(() => {
				timeoutId = undefined;
				setValue(pendingValue);
			}, delay);
		}
	};
}
