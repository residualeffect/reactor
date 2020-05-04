import { Observable } from "./Observable";

export enum RateLimitType {
	Debounce,
	Throttle
}

export class RateLimitedObservable<T> extends Observable<T> {
	public constructor(initialValue: T, type: RateLimitType, delay: number) {
		super(initialValue);

		this._type = type;
		this._delay = delay;

		this._timeoutId = undefined;
	}

	protected SetValueAndNotifyObservers(newValue: T): void {
		this._pendingValue = newValue;

		if (this._type === RateLimitType.Debounce && this._timeoutId !== undefined) {
			clearTimeout(this._timeoutId);
			this._timeoutId = undefined;
		}

		if (this._timeoutId === undefined) {
			this._timeoutId = setTimeout(() => {
				this._timeoutId = undefined;
				super.SetValueAndNotifyObservers(this._pendingValue);
			}, this._delay);
		}
	}

	private _type: RateLimitType;
	private _delay: number;

	private _pendingValue!: T;
	private _timeoutId?: NodeJS.Timeout;
}
