import { BaseObservable } from "./BaseObservable";

export class Observable<T> extends BaseObservable<T> {
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
}
