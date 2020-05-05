import type { Observer, Unsubscribe } from "./BaseObservable";

export interface ReadOnlyObservable<T> {
	readonly Value: T;
	Subscribe(observer: Observer<T>): Unsubscribe;
}
