
export function ThenObserverCallCountIs(mockObserver: jest.Mock, totalCalls: number): void {
	expect(mockObserver.mock.calls.length).toBe(totalCalls);
}

export function ThenObserverWasCalled<T>(mockObserver: jest.Mock, totalCalls: number, newValue: T, oldValue: T): void {
	ThenObserverCallCountIs(mockObserver, totalCalls);
	expect(mockObserver.mock.calls[totalCalls - 1][0]).toBe(newValue);
	expect(mockObserver.mock.calls[totalCalls - 1][1]).toBe(oldValue);
}
