import { BaseObservable, EqualityComparison } from "./BaseObservable";
import type { ReadOnlyObservable } from "./ReadOnlyObservable";

export class ObservableArray<T> extends BaseObservable<T[]> implements ReadOnlyObservable<readonly T[]> {
	public constructor(initialValue: readonly T[], onChangeEqualityComparison?: EqualityComparison<readonly T[]>) {
		super(initialValue.slice(), onChangeEqualityComparison);
	}

	public get Value(): readonly T[] {
		return this.Get();
	}

	public set Value(newValue: readonly T[]) {
		this.SetIfChanged(newValue.slice());
	}

	public get length(): number {
		return this.Get().length;
	}

	public clear(): void {
		this._value = [];
		this.NotifyObservers();
	}

	public push(...items: readonly T[]): number {
		const result = this._value.push(...items);
		this.NotifyObservers();
		return result;
	}

	public pop(): T | undefined {
		const result = this._value.pop();
		this.NotifyObservers();
		return result;
	}

	public shift(): T | undefined {
		const result = this._value.shift();
		this.NotifyObservers();
		return result;
	}

	public unshift(...items: readonly T[]): number {
		const result = this._value.unshift(...items);
		this.NotifyObservers();
		return result;
	}

	public concat(items: readonly T[]): void {
		this._value.push(...items);
		this.NotifyObservers();
	}

	public reverse(): void {
		this._value.reverse();
		this.NotifyObservers();
	}

	public sort(compareFn?: (a: T, b: T) => number): void {
		this._value.sort(compareFn);
		this.NotifyObservers();
	}

	public splice(start: number, deleteCount: number, ...items: readonly T[]): readonly T[] {
		const result = this._value.splice(start, deleteCount, ...items);
		this.NotifyObservers();
		return result;
	}

	public swap(indexA: number, indexB: number): void {
		const a = this._value[indexA];
		this._value[indexA] = this._value[indexB];
		this._value[indexB] = a;
		this.NotifyObservers();
	}

	public remove(item: T): boolean {
		const oldArray = this._value;
		const newArray = oldArray.filter((i) => i !== item);

		if (oldArray.length !== newArray.length) {
			this._value = newArray;
			this.NotifyObservers();
			return true;
		} else {
			return false;
		}
	}

	public toggle(item: T): boolean {
		if (!this.remove(item)) {
			this.push(item);
			return true;
		}
		return false;
	}

	public Update(transform: (value: T[]) => void): void {
		transform(this.Value as T[]);
		this.NotifyObservers();
	}

	public UpdateWhen(condition: (value: readonly T[]) => boolean, transform: (value: T[]) => void): void {
		if (condition(this.Value)) {
			this.Update(transform);
		}
	}

	public AsArray(): T[] {
		return this.Get().slice();
	}

	public AsReadOnly(): ReadOnlyObservable<readonly T[]> {
		return this;
	}
}
