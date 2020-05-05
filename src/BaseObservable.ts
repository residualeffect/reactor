import { ReportUsage } from "./DependencyTracking";
import type { Observer, Unsubscribe } from "./Observer";

interface Subscriptions<T> {
	[subscriptionId: number]: Observer<T>;
}

let observableId = 0;

export class BaseObservable<T> {
	public constructor(initialValue: T) {
		this._observableId = observableId++;

		this._value = initialValue;

		this._nextSubscriptionId = 0;
		this._subscriptionCount = 0;
		this._subscriptions = {};
	}

	public Subscribe(observer: Observer<T>): Unsubscribe {
		const subscriptionId = this._nextSubscriptionId++;
		this._subscriptions[subscriptionId] = observer;
		this._subscriptionCount++;

		let removed = false;
		return (): void => {
			if (removed) {
				return;
			}

			delete this._subscriptions[subscriptionId];
			this._subscriptionCount--;
			removed = true;
		};
	}

	public get SubscriptionCount(): number {
		// Note that this performs faster than using Object.keys and returning the length of that or counting iterations
		return this._subscriptionCount;
	}

	protected Get(): T {
		ReportUsage(this as BaseObservable<unknown>);
		return this._value;
	}

	protected SetIfChanged(newValue: T): void {
		if (newValue == this._value) {
			return;
		}

		this._value = newValue;
		this.NotifyObservers();
	}

	protected NotifyObservers(): void {
		for (const key in this._subscriptions) {
			this._subscriptions[key](this._value);
		}
	}

	public readonly _observableId: number;

	protected _value: T;

	private _nextSubscriptionId: number;
	private _subscriptionCount: number;
	private readonly _subscriptions: Subscriptions<T>;
}
