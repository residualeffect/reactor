import { FilteredObservable } from "../src/FilteredObservable";
import { RateLimiter, RateLimitType } from "../src/RateLimiter";
import { ThenObserverCallCountIs, ThenObserverWasCalled } from "./TestHelpers";

let mockObserver: jest.Mock;

jest.useFakeTimers();

beforeEach(() => {
	mockObserver = jest.fn();
});

test("Should only notify subscribers after delay period has passed", () => {
	const t = new FilteredObservable(true, RateLimiter(RateLimitType.Debounce, 1000));

	t.Subscribe(mockObserver);

	expect(t.Value).toStrictEqual(true);

	t.Value = false;

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toStrictEqual(true);

	jest.advanceTimersByTime(999);

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toStrictEqual(true);

	jest.advanceTimersByTime(1);

	ThenObserverWasCalled(mockObserver, 1, false);
	expect(t.Value).toStrictEqual(false);
});

test("Should de-duplicate changes", () => {
	const t = new FilteredObservable(10, RateLimiter(RateLimitType.Debounce, 1000));

	t.Subscribe(mockObserver);

	expect(t.Value).toStrictEqual(10);

	t.Value = 15;
	t.Value = 25;
	t.Value = 30;
	t.Value = 35;

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toStrictEqual(10);

	jest.advanceTimersByTime(1000);

	ThenObserverWasCalled(mockObserver, 1, 35);
	expect(t.Value).toStrictEqual(35);
});

test("Should reset notification timer after every change when using debounce rate limiter", () => {
	const t = new FilteredObservable(3, RateLimiter(RateLimitType.Debounce, 1000));

	t.Subscribe(mockObserver);

	t.Value = 4;

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toStrictEqual(3);

	jest.advanceTimersByTime(999);

	t.Value = 5;

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toStrictEqual(3);

	jest.advanceTimersByTime(999);

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toStrictEqual(3);

	jest.advanceTimersByTime(1);

	ThenObserverWasCalled(mockObserver, 1, 5);
	expect(t.Value).toStrictEqual(5);
});


test("Should still notify subscribers at fixed intervals when using throttle rate limiter", () => {
	const t = new FilteredObservable(3, RateLimiter(RateLimitType.Throttle, 1000));

	t.Subscribe(mockObserver);

	t.Value = 4;

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toStrictEqual(3);

	jest.advanceTimersByTime(999);

	t.Value = 5;

	ThenObserverCallCountIs(mockObserver, 0);
	expect(t.Value).toStrictEqual(3);

	jest.advanceTimersByTime(1);

	ThenObserverWasCalled(mockObserver, 1, 5);
	expect(t.Value).toStrictEqual(5);

	t.Value = 8;

	jest.advanceTimersByTime(999);

	ThenObserverCallCountIs(mockObserver, 1);
	expect(t.Value).toStrictEqual(5);

	jest.advanceTimersByTime(1);

	ThenObserverWasCalled(mockObserver, 2, 8);
	expect(t.Value).toStrictEqual(8);
});
