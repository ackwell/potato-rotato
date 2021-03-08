import {bytesToBase64, base64ToBytes} from 'byte-base64'
import {atom} from 'jotai'
import msgpack from 'msgpack-lite'
import pako from 'pako'

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
		// Run the gauntlet of SMOL
		// TODO: is msgpack worth the 8kb of lib code on top of the mandatory 13kb of pako?
		const rotation = get(itemsAtom)[Bucket.ROTATION]
		const strippedKeys = rotation.map(item => ({
			...item,
			key: undefined,
		}))
		const bin = msgpack.encode(strippedKeys)
		const deflate = pako.deflateRaw(bin)
		const b64 = bytesToBase64(deflate)

		return b64
	},
	(get, set, update: string) => {
		// oh BOY now we need to REVERSE it. it BEEG now
		const deflate = base64ToBytes(update)
		const bin = pako.inflateRaw(deflate)
		const newRotation = msgpack.decode(bin) as Item[]
		set(itemsAtom, items => ({
			...items,
			[Bucket.ROTATION]: newRotation.map(getDraggableItem),
		}))
	},
)

export const paletteAtom = atom(
	get => get(itemsAtom)[Bucket.PALETTE],
	(get, set, update: DraggableItem[]) => {
		set(itemsAtom, items => ({
			...items,
			[Bucket.PALETTE]: update,
		}))
	},
)
