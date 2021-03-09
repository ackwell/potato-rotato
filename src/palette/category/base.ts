export interface Action {
	id: number
}

export interface ActionCategory {
	name: string
	actions: Action[]
}
