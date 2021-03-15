import {bytesToBase64, base64ToBytes} from 'byte-base64'
import {atom} from 'jotai'
import msgpack from 'msgpack-lite'
import pako from 'pako'
import {exists} from './utils'

export enum ItemType {
	ACTION = 0,
	PULL = 1,
}

export type ActionItem = {type: ItemType.ACTION; action: number}
export type PullItem = {type: ItemType.PULL}
export type Item = ActionItem | PullItem

export type Draggable<I extends Item> = I & {key: string}

export enum Bucket {
	ROTATION = 'ROTATION',
	PALETTE = 'PALETTE',
	BIN = 'BIN',
}

// thanks i hate it
let nextDraggableId = 0
export const getDraggableKey = () => `${nextDraggableId++}`

export const getDraggableItem = (item: Item): Draggable<Item> => ({
	...item,
	key: getDraggableKey(),
})

export const rotationAtom = atom<string[]>([])

// TODO this hsould be a context
export const idMap = new Map<string, Item>()

// TODO: should we store items by keys separate to the keys in the draggable data, or keep them merged? consider.
// export type Items = Record<Bucket, Draggable<Item>[]>
// export const itemsAtom = atom<Items>({
// 	[Bucket.ROTATION]: [],
// 	[Bucket.PALETTE]: [],
// 	[Bucket.BIN]: [],
// })

export const serialisedRotationAtom = atom(
	get => {
		// Run the gauntlet of SMOL
		// TODO: is msgpack worth the 8kb of lib code on top of the mandatory 13kb of pako?
		// const rotation = get(itemsAtom)[Bucket.ROTATION]
		const rotation = get(rotationAtom)
			.map(id => idMap.get(id))
			.filter(exists)
		// const strippedKeys = rotation.map(item => ({
		// 	...item,
		// 	key: undefined,
		// }))
		const bin = msgpack.encode(rotation)
		const deflate = pako.deflateRaw(bin)
		const b64 = bytesToBase64(deflate)

		return b64
	},
	(get, set, update: string) => {
		// oh BOY now we need to REVERSE it. it BEEG now
		const deflate = base64ToBytes(update)
		const bin = pako.inflateRaw(deflate)
		const newRotation = msgpack.decode(bin) as Item[]

		// this is pretty disgusting ngl
		const ids = newRotation.map(item => {
			const id = getDraggableKey()
			idMap.set(id, item)
			return id
		})

		// set(itemsAtom, items => ({
		// 	...items,
		// 	[Bucket.ROTATION]: newRotation.map(getDraggableItem),
		// }))
		set(rotationAtom, ids)
	},
)
