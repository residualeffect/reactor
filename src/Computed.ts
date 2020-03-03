import { ReadOnlyObservable } from "./ReadOnlyObservable";
import { TrackDependencies, DependencyMap, ValueGeneratorError } from "./DependencyTracking";

export class Computed<T> extends ReadOnlyObservable<T> {
	public constructor(valueGenerator: () => T) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		super(undefined!);

		this._valueGenerator = valueGenerator;

		this._isRefreshing = false;
		this._dependencies = {};

		this.RefreshValue();
	}

	public get DependencyCount(): number {
		return Object.keys(this._dependencies).length;
	}

	private RefreshValue = (): T => {
		if (this._isRefreshing) {
			throw new Error("Circular dependency detected!");
		}

		try {
			this._isRefreshing = true;

			const [value, dependencies] = TrackDependencies(this._valueGenerator);

			this.UpdateDependencies(dependencies);
			this.SetIfChanged(value);
		}
		catch (e) {
			if (e instanceof ValueGeneratorError) {
				throw new ValueGeneratorError(this._valueGenerator, e);
			} else if (e instanceof Error) {
				throw new ValueGeneratorError(this._valueGenerator, undefined, e.message);
			} else {
				throw new ValueGeneratorError(this._valueGenerator, undefined, e+"");
			}
		}
		finally {
			this._isRefreshing = false;
		}

		return this._value;
	};

	private UpdateDependencies(newDependencies: DependencyMap): void {
		for (const key in this._dependencies) {
			if (newDependencies[key] === undefined) {
				const unsubscribe = this._dependencies[key].Unsubscribe;
				if (unsubscribe !== undefined) {
					unsubscribe();
				}

				delete this._dependencies[key];
			}
		}

		for (const key in newDependencies) {
			if (this._dependencies[key] === undefined) {
				const dependency = newDependencies[key];
				dependency.Unsubscribe = dependency.Observable.Subscribe(this.RefreshValue);
				this._dependencies[key] = dependency;
			}
		}
	}

	private readonly _valueGenerator: () => T;

	private _isRefreshing: boolean;
	private readonly _dependencies: DependencyMap;
}
