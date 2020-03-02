import { ReadOnlyObservable } from "./ReadOnlyObservable";

export class Observable<T> extends ReadOnlyObservable<T> {
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

	public get AsReadOnly(): ReadOnlyObservable<T> {
		return this;
	}
}
