export interface Action {
	id: number
}

export interface ActionCategory {
	name: string
	fetchActions: () => Promise<Action[]>
}
