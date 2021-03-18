import {bytesToBase64, base64ToBytes} from 'byte-base64'
import {atom} from 'jotai'
import {atomFamily} from 'jotai/utils'
import msgpack from 'msgpack-lite'
import pako from 'pako'
import {exists} from './utils'

export enum Mode {
	EDIT = 'edit',
	VIEW = 'view',
}

export const modeAtom = atom<Mode>(Mode.EDIT)

export enum ItemType {
	ACTION = 0,
	PULL = 1,
}

export type ActionItem = {type: ItemType.ACTION; action: number}
export type PullItem = {type: ItemType.PULL}
export type Item = ActionItem | PullItem

// thanks i hate it
let nextDraggableId = 0
export const getDraggableId = () => `${nextDraggableId++}`

export const rotationAtom = atom<string[]>([])

// Family of items mapped to their current draggable ID
export const itemFamily = atomFamily(
	(id: string) => undefined as Item | undefined,
)

export const serialisedRotationAtom = atom(
	get => {
		// Turn the rotation into a list of items - IDs are only relevant to a single runtime
		const rotation = get(rotationAtom)
			.map(id => get(itemFamily(id)))
			.filter(exists)

		// Run the gauntlet of SMOL
		// TODO: is msgpack worth the 8kb of lib code on top of the mandatory 13kb of pako?
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

		// Create IDs for the items in the rotation, and assign them into the map
		const ids = newRotation.map(item => {
			const id = getDraggableId()
			set(itemFamily(id), item)
			return id
		})

		set(rotationAtom, ids)
	},
)
