// TODO: might be able to just... steal the column system from tooltips to make defining the response shapes less horrible

// TODO: configurable for CN and shit
export const API_HOST = 'https://xivapi.com'

// TODO: Handle pagination, internalise this
export interface XivApiListing<T> {
	Results: T[]
}

// TODO: Handle listing pagination?
export const fetchXivapi = <T = any>(request: string): Promise<T> =>
	fetch(`https://xivapi.com/${request}`).then(resp => resp.json())
