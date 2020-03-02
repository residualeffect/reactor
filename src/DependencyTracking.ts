import type { ReadOnlyObservable, Unsubscribe } from "./ReadOnlyObservable";

export interface Dependency {
	readonly Observable: ReadOnlyObservable<unknown>;
	Unsubscribe?: Unsubscribe;
}

export interface DependencyMap {
	[observableId: number]: Dependency;
}

const dependencyStack: DependencyMap[] = [];

export function ReportUsage(observable: ReadOnlyObservable<unknown>): void {
	if (dependencyStack.length > 0) {
		const currentStack = dependencyStack[dependencyStack.length - 1];
		if (currentStack[observable._observableId] === undefined) {
			currentStack[observable._observableId] = { Observable: observable };
		}
	}
}

function StartTracking(): void {
	dependencyStack.push({});
}

function FinishTracking(): DependencyMap {
	return dependencyStack.pop() ?? {};
}

export function TrackDependencies<T>(valueGenerator: () => T): [T, DependencyMap] {
	StartTracking();
	const value = valueGenerator();
	const dependencies = FinishTracking();

	return [value, dependencies];
}
