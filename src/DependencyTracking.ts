import type { ReadOnlyObservable, Unsubscribe } from "./ReadOnlyObservable";

export interface Dependency {
	readonly Observable: ReadOnlyObservable<unknown>;
	Unsubscribe?: Unsubscribe;
}

export class ValueGeneratorError extends Error {
	public constructor(valueGenerator: Function, innerValueGeneratorError?: ValueGeneratorError, errorMessage?: string) {
		let message = `An error occurred while generating a computed value.  Value Generator:\n\n${valueGenerator}`;
		if (innerValueGeneratorError) {
			message += innerValueGeneratorError.InnerMessage(1);
		}
		if (errorMessage) {
			message += `\n\nThe error was: ${errorMessage}`;
		}

		super(message);

		this.name = "ValueGeneratorError";
		this.ValueGeneratorFailureReason = errorMessage;
		this.ValueGenerator = valueGenerator;
		this.InnerValueGeneratorError = innerValueGeneratorError;
	}

	public InnerMessage(depth: number): string {
		let message = `\n\nNested Value Generator (depth ${depth}):\n\n${this.ValueGenerator}`; 
		if (this.ValueGeneratorFailureReason) {
			message += `\n\nNested error (depth ${depth}): ${this.ValueGeneratorFailureReason}`;
		}
		if (this.InnerValueGeneratorError) {
			message += this.InnerValueGeneratorError.InnerMessage(depth + 1);
		}
		return message;
	}

	public ValueGeneratorFailureReason: string|undefined;
	public ValueGenerator: Function;
	public InnerValueGeneratorError?: ValueGeneratorError;
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

export function IsTracking(): boolean {
	return dependencyStack.length > 0;
}

function StartTracking(): void {
	dependencyStack.push({});
}

function FinishTracking(): DependencyMap {
	return dependencyStack.pop() ?? {};
}

export function TrackDependencies<T>(valueGenerator: () => T): [T, DependencyMap] {
	let value!: T;
	let error: Error|undefined;

	StartTracking();

	try {
		value = valueGenerator();
	}
	catch (e) {
		if (e instanceof ValueGeneratorError) {
			error = new ValueGeneratorError(valueGenerator, e);
		} else if (e instanceof Error) {
			error = new ValueGeneratorError(valueGenerator, undefined, e.message);
		} else {
			error = new ValueGeneratorError(valueGenerator, undefined, e+"");
		}
	}

	const dependencies = FinishTracking();

	if (error) {
		throw error;
	}

	return [value, dependencies];
}
