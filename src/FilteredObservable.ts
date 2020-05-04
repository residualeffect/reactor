import { Observable } from "./Observable";

export type ValueFilter<T> = (newValue: T, setValue: (newValue: T) => void) => void;

export class FilteredObservable<T> extends Observable<T> {
	public constructor(initialValue: T, valueModifier: ValueFilter<T>) {
		super(initialValue);

		this._valueFilter = valueModifier;
	}

	protected SetIfChanged(newValue: T): void {
		if (newValue == this._value) {
			return;
		}

		this._valueFilter(newValue, (filteredNewValue) => {
			super.SetIfChanged(filteredNewValue);
		});
	}

	private _valueFilter: ValueFilter<T>;
}
