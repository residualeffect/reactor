import { ReadOnlyObservable, Unsubscribe, Observer } from "./ReadOnlyObservable";
import { TrackDependencies, DependencyMap, ReportUsage } from "./DependencyTracking";

export class Computed<T> extends ReadOnlyObservable<T> {
	public constructor(valueGenerator: () => T) {
		super(valueGenerator());

		this._valueGenerator = valueGenerator;

		this._isRefreshing = false;
		this._isListening = false;
		this._dependencies = {};
	}

	public get Value(): T {
		ReportUsage(this as ReadOnlyObservable<unknown>);
		return this._isListening ? this._value : this.RefreshValue();
	}

	public Subscribe(observer: Observer<T>): Unsubscribe {
		const unsubscribe = super.Subscribe(observer);
		this.UpdateListeningStatus();

		return (): void => {
			unsubscribe();
			this.UpdateListeningStatus();
		};
	}

	public get DependencyCount(): number {
		return Object.keys(this._dependencies).length;
	}

	private UpdateListeningStatus(): void {
		if (this.SubscriptionCount === 1) {
			this._isListening = true;
			this.RefreshValue();
		} else if (this.SubscriptionCount === 0) {
			this.StopListening();
		}
	}

	private RefreshValue = (): T => {
		if (this._isRefreshing) {
			throw "Circular dependency detected!";
		}

		this._isRefreshing = true;

		const [value, dependencies] = TrackDependencies(this._valueGenerator);

		this.UpdateDependencies(dependencies);
		this.SetIfChanged(value);

		this._isRefreshing = false;

		return this._value;
	};

	private StopListening(): void {
		if (!this._isListening) {
			throw "Stopped listening again after listeners were already stopped!";
		}

		for (const key in this._dependencies) {
			const dependency = this._dependencies[key];

			if (dependency.Unsubscribe !== undefined) {
				dependency.Unsubscribe();
				dependency.Unsubscribe = undefined;
			} else {
				throw "Not observing a dependency when it was supposed to!";
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
			} else if(this._isListening) {
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

	private readonly _valueGenerator: () => T;

	private _isRefreshing: boolean;
	private _isListening: boolean;
	private readonly _dependencies: DependencyMap;
}
