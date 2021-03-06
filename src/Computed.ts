import { BaseObservable } from "./BaseObservable";
import { TrackDependencies, DependencyMap, ValueGeneratorError, ReportUsage } from "./DependencyTracking";
import type { Unsubscribe, Observer } from "./Observer";
import type { ReadOnlyObservable } from "./ReadOnlyObservable";

export class Computed<T> extends BaseObservable<T> implements ReadOnlyObservable<T> {
	public constructor(valueGenerator: () => T) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		super(undefined!);

		this.ValueGenerator = valueGenerator;

		this._isRefreshing = false;
		this._isListening = false;
		this._dependencies = {};

		this.RefreshValue();
	}

	public get Value(): T {
		ReportUsage(this as BaseObservable<unknown>);

		if (!this._isListening) {
			this.RefreshValue();
		}

		return this._value;
	}

	public get DependencyCount(): number {
		let count = 0;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for (const _ in this._dependencies) {
			count++;
		}
		return count;
	}

	public get ActiveDependencyCount(): number {
		let count = 0;
		for (const key in this._dependencies) {
			const dependency = this._dependencies[key];

			if (dependency.Unsubscribe !== undefined) {
				count++;
			}
		}
		return count;
	}

	public Subscribe(observer: Observer<T>): Unsubscribe {
		const unsubscribe = super.Subscribe(observer);
		this.UpdateListeningStatus();

		return (): void => {
			unsubscribe();
			this.UpdateListeningStatus();
		};
	}

	public AsReadOnly(): ReadOnlyObservable<T> {
		return this;
	}

	private RefreshValue = (): void => {
		if (this._isRefreshing) {
			throw new Error("Circular dependency detected!");
		}

		try {
			this._isRefreshing = true;

			const [value, dependencies] = TrackDependencies(this.ValueGenerator);
			this.SetIfChanged(value);

			this._isRefreshing = false;

			this.UpdateDependencies(dependencies);
		}
		catch (e) {
			this._isRefreshing = false;

			if (e instanceof ValueGeneratorError) {
				throw new ValueGeneratorError(this.ValueGenerator, e);
			} else if (e instanceof Error) {
				throw new ValueGeneratorError(this.ValueGenerator, undefined, e.message);
			} else {
				// This shouldn't happen, but typescript doesn't understand
				throw new ValueGeneratorError(this.ValueGenerator, undefined, e);
			}
		}
	};

	private UpdateListeningStatus(): void {
		if (this.SubscriptionCount === 1) {
			this._isListening = true;
			this.RefreshValue();
		} else if (this.SubscriptionCount === 0) {
			this.StopListening();
		}
	}

	private StopListening(): void {
		if (!this._isListening) {
			return;
		}

		for (const key in this._dependencies) {
			const dependency = this._dependencies[key];

			if (dependency.Unsubscribe !== undefined) {
				dependency.Unsubscribe();
				dependency.Unsubscribe = undefined;
			}
		}

		this._isListening = false;
	}

	private UpdateDependencies(newDependencies: DependencyMap): void {
		for (const key in this._dependencies) {
			if (newDependencies[key] === undefined) {
				const unsubscribe = this._dependencies[key].Unsubscribe;
				if (unsubscribe !== undefined) {
					unsubscribe();
				}

				delete this._dependencies[key];
			} else if (this._isListening) {
				const dependency = this._dependencies[key];
				if (dependency.Unsubscribe === undefined) {
					dependency.Unsubscribe = dependency.Observable.Subscribe(this.RefreshValue);
				}
			}
		}

		for (const key in newDependencies) {
			if (this._dependencies[key] === undefined) {
				const dependency = newDependencies[key];
				if (this._isListening) {
					dependency.Unsubscribe = dependency.Observable.Subscribe(this.RefreshValue);
				}
				this._dependencies[key] = dependency;
			}
		}
	}

	public readonly ValueGenerator: () => T;

	private _isRefreshing: boolean;
	private _isListening: boolean;
	private readonly _dependencies: DependencyMap;
}
