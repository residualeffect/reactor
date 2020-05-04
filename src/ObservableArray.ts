import { BaseObservable } from "./BaseObservable";

export class ObservableArray<T> extends BaseObservable<T[]> {
	public constructor(initialValue: T[]) {
		super(initialValue);
	}

	public get Value(): readonly T[] {
		return this.Get();
	}

	public set Value(newValue: readonly T[]) {
		this.SetIfChanged(newValue as T[]);
	}

	public clear(): void {
		this._value = [];
		this.NotifyObservers();
	}

	public push(...items: T[]): number {
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

	public unshift(...items: T[]): number {
		const result = this._value.unshift(...items);
		this.NotifyObservers();
		return result;
	}

	public reverse(): T[] {
		const result = this._value.reverse();
		this.NotifyObservers();
		return result;
	}

	public sort(compareFn?: (a: T, b: T) => number): T[] {
		const result = this._value.sort(compareFn);
		this.NotifyObservers();
		return result;
	}

	public splice(start: number, deleteCount: number, ...items: T[]): T[] {
		const result = this._value.splice(start, deleteCount, ...items);
		this.NotifyObservers();
		return result;
	}
}
