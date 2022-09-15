import type { Observer, Unsubscribe } from "./Observer";

export interface ReadOnlyObservable<T> {
	readonly Value: T;
	Subscribe(observer: Observer<T>): Unsubscribe;
	IsEqualTo(otherValue: T): boolean;
}
