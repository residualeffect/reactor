import { BaseObservable, EqualityComparison } from "./BaseObservable";
import type { Immutable } from "./Immutable";
import type { ReadOnlyObservable } from "./ReadOnlyObservable";

export class ObservableObject<T extends object> extends BaseObservable<Immutable<T>> implements ReadOnlyObservable<Immutable<T>> {
	public constructor(initialValue: Immutable<T>, onChangeEqualityComparison?: EqualityComparison<Immutable<T>>) {
		super(initialValue, onChangeEqualityComparison);
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

	public AsReadOnly(): ReadOnlyObservable<Immutable<T>> {
		return this;
	}
}
