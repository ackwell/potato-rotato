import {ActionItem, Item, ItemType} from '../../state'

export interface Action {
	id: number
}

export interface Category {
	name: string
	fetchItems: () => Promise<Item[]>
}

export const actionToItem = (action: Action): ActionItem => ({
	type: ItemType.ACTION,
	action: action.id,
})
