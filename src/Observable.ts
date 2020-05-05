import { BaseObservable } from "./BaseObservable";
import type { ReadOnlyObservable } from "./ReadOnlyObservable";

export class Observable<T> extends BaseObservable<T> implements ReadOnlyObservable<T> {
	public constructor(initialValue: T) {
		super(initialValue);
	}

	public get Value(): T {
		return this.Get();
	}

	public set Value(newValue: T) {
		this.SetIfChanged(newValue);
	}

	public Update(transform: (oldValue: T) => T): void {
		this.SetIfChanged(transform(this._value));
	}

	public AsReadOnly(): ReadOnlyObservable<T> {
		return this;
	}
}
