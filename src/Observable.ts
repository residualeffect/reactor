import { BaseObservable, EqualityComparison } from "./BaseObservable";
import type { ReadOnlyObservable } from "./ReadOnlyObservable";

export class Observable<T> extends BaseObservable<T> implements ReadOnlyObservable<T> {
	/**
	 * Create a new observable.
	 * @param initialValue The initial value of this new observable.
	 */
	public constructor(initialValue: T, onChangeEqualityComparison?: EqualityComparison<T>) {
		super(initialValue, onChangeEqualityComparison);
	}

	/**
	 * Get the current value of this observable.
	 */
	public get Value(): T {
		return this.Get();
	}

	/**
	 * Set a new value for this observable.
	 */
	public set Value(newValue: T) {
		this.SetIfChanged(newValue);
	}

	/**
	 * Update the current value of this observable using a transformation function.
	 * @param transform Function that receives the current value of this observable, and returns a new value to set for this observable.
	 */
	public Update(transform: (oldValue: T) => T): void {
		this.SetIfChanged(transform(this._value));
	}

	/**
	 * Cast this observable as a read-only variant.
	 * @returns This observable as a ReadOnlyObservable.
	 */
	public AsReadOnly(): ReadOnlyObservable<T> {
		return this;
	}
}
