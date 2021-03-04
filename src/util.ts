export class UnreachableError extends Error {
	constructor(value: never) {
		super(`Impossible condition: got ${value}`)
	}
}
