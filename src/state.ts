import {atom} from 'jotai'

export enum ItemType {
	ACTION,
}

export type ActionItem = {type: ItemType.ACTION; action: number}
export type Item = ActionItem
export type DraggableItem = Item & {key: string}

export enum Bucket {
	ROTATION = 'ROTATION',
	PALETTE = 'PALETTE',
	BIN = 'BIN',
}

// thanks i hate it
let nextDraggableId = 0
const getDraggableKey = () => `${nextDraggableId++}`

export const getDraggableItem = (item: Item): DraggableItem => ({
	...item,
	key: getDraggableKey(),
})

// TODO: should we store items by keys separate to the keys in the draggable data, or keep them merged? consider.
export type Items = Record<Bucket, DraggableItem[]>
export const itemsAtom = atom<Items>({
	[Bucket.ROTATION]: [],
	[Bucket.PALETTE]: [],
	[Bucket.BIN]: [],
})

export const serialisedRotationAtom = atom(
	get => {
		const rotation = get(itemsAtom)[Bucket.ROTATION]
		// TODO: Find better encoding to squidge this up a bit
		// TODO: Will need to switch case the serialisation of the data segment
		return rotation.map(item => `${item.type}|${item.action}`).join(',')
	},
	(get, set, update: string) => {
		const things = update.split(',')
		const newRotation = things.map(thing => {
			const [type, action] = thing.split('|').map(fuck => parseInt(fuck, 10))
			return getDraggableItem({type, action})
		})
		set(itemsAtom, items => ({
			...items,
			[Bucket.ROTATION]: newRotation,
		}))
	},
)

export const paletteAtom = atom(
	get => get(itemsAtom)[Bucket.PALETTE],
	(get, set, update: Item[]) => {
		set(itemsAtom, items => ({
			...items,
			[Bucket.PALETTE]: update.map(item => getDraggableItem(item)),
		}))
	},
)
