import { BaseObservable } from "./BaseObservable";
import type { Immutable } from "./Immutable";

export class ObservableObject<T extends object> extends BaseObservable<Immutable<T>> {
	public constructor(initialValue: Immutable<T>) {
		super(initialValue);
	}

	public get Value(): Immutable<T> {
		return this.Get();
	}

	public set Value(newValue: Immutable<T>) {
		this.SetIfChanged(newValue);
	}

	public Update(transform: (value: T) => void): void {
		transform(this.Value as T);
		this.NotifyObservers();
	}

	public UpdateWhen(condition: (value: Immutable<T>) => boolean, transform: (value: T) => void): void {
		if (condition(this.Value)) {
			this.Update(transform);
		}
	}
}
