import { RateLimitedObservable, RateLimitType } from "../src/RateLimitedObservable";
import { ThenObserverCallCountIs, ThenObserverWasCalled } from "./TestHelpers";

let mockObserver: jest.Mock;

jest.useFakeTimers();

beforeEach(() => {
	mockObserver = jest.fn();
});

test("Should only notify subscribers after delay period has passed", () => {
	const t = new RateLimitedObservable(true, RateLimitType.Debounce, 1000);

	t.Subscribe(mockObserver);

	expect(t.Value).toBe(true);

	t.Value = false;

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toBe(true);

	jest.advanceTimersByTime(999);

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toBe(true);

	jest.advanceTimersByTime(1);

	ThenObserverWasCalled(mockObserver, 1, false, true);
	expect(t.Value).toBe(false);
});

test("Should de-duplicate changes", () => {
	const t = new RateLimitedObservable(10, RateLimitType.Debounce, 1000);

	t.Subscribe(mockObserver);

	expect(t.Value).toBe(10);

	t.Value = 15;
	t.Value = 25;
	t.Value = 30;
	t.Value = 35;

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toBe(10);

	jest.advanceTimersByTime(1000);

	ThenObserverWasCalled(mockObserver, 1, 35, 10);
	expect(t.Value).toBe(35);
});

test("Should reset notification timer after every change when using debounce rate limiter", () => {
	const t = new RateLimitedObservable(3, RateLimitType.Debounce, 1000);

	t.Subscribe(mockObserver);

	t.Value = 4;

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toBe(3);

	jest.advanceTimersByTime(999);

	t.Value = 5;

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toBe(3);

	jest.advanceTimersByTime(999);

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toBe(3);

	jest.advanceTimersByTime(1);

	ThenObserverWasCalled(mockObserver, 1, 5, 3);
	expect(t.Value).toBe(5);
});


test("Should still notify subscribers at fixed intervals when using throttle rate limiter", () => {
	const t = new RateLimitedObservable(3, RateLimitType.Throttle, 1000);

	t.Subscribe(mockObserver);

	t.Value = 4;

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toBe(3);

	jest.advanceTimersByTime(999);

	t.Value = 5;

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toBe(3);

	jest.advanceTimersByTime(1);

	ThenObserverWasCalled(mockObserver, 1, 5, 3);
	expect(t.Value).toBe(5);

	t.Value = 8;

	jest.advanceTimersByTime(999);

	ThenObserverCallCountIs(mockObserver, 1);
	expect(t.Value).toBe(5);

	jest.advanceTimersByTime(1);

	ThenObserverWasCalled(mockObserver, 2, 8, 5);
	expect(t.Value).toBe(8);
});
