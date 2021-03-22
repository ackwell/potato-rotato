import {ItemType} from '../../state'
import {Category} from './base'

export const utilityCategory: Category = {
	name: 'Utilities',
	fetchItems: () =>
		Promise.resolve([{type: ItemType.PULL}, {type: ItemType.ANNOTATION}]),
}
