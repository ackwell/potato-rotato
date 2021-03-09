// TODO: might be able to just... steal the column system from tooltips to make defining the response shapes less horrible
// Realistically, most of this logic is only relevant to a single component that uses it. This file should be cut back to just xivapi generic utilities,
// with component specific lookup logic moved to that component/package.

// TODO: Handle pagination, internalise this
export interface XivApiListing<T> {
	Results: T[]
}

// TODO: Handle listing pagination?
export const fetchXivapi = <T = any>(request: string): Promise<T> =>
	fetch(`https://xivapi.com/${request}`).then(resp => resp.json())
