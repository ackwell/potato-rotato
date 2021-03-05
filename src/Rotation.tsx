import {Tooltip} from '@xivanalysis/tooltips'
import {atom, useAtom} from 'jotai'
import {useUpdateAtom} from 'jotai/utils'
import {useCallback} from 'react'
import {
	DragDropContext,
	Draggable,
	Droppable,
	DropResult,
} from 'react-beautiful-dnd'
import {PALETTE_DROPPABLE} from './Palette'

export type RotationItem = {key: string} & {type: 'action'; action: number}

const rotationAtom = atom<RotationItem[]>([])

interface RotationContextProps {
	children?: React.ReactNode
}

let nextItemKey = 0
const getNextItemKey = () => `rotationItem:${nextItemKey++}`

export function RotationContext({children}: RotationContextProps) {
	const setRotation = useUpdateAtom(rotationAtom)

	const onDragEnd = useCallback(
		({draggableId, source, destination}: DropResult) => {
			// todo we'll want more than purely actions, figure out ids in a non-meme way
			// this entire handling is pretty meme right now

			// palette -> rotation drops an action
			if (
				source.droppableId === PALETTE_DROPPABLE &&
				destination?.droppableId === ROTATION_DROPPABLE
			) {
				setRotation(rotation => {
					const output = rotation.slice()
					output.splice(destination.index, 0, {
						key: getNextItemKey(),
						type: 'action',
						action: parseInt(draggableId, 10),
					})
					return output
				})
			}

			// rotation -> rotation reorders the rotation by their unique key
			if (
				source.droppableId === ROTATION_DROPPABLE &&
				destination?.droppableId === ROTATION_DROPPABLE
			) {
				setRotation(rotation => {
					const output = rotation.slice()
					const [item] = output.splice(source.index, 1)
					output.splice(destination.index, 0, item)
					return output
				})
			}
		},
		[setRotation],
	)

	return <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>
}

export const ROTATION_DROPPABLE = 'rotation'

export function Rotation() {
	const [items] = useAtom(rotationAtom)

	return (
		<Droppable droppableId={ROTATION_DROPPABLE}>
			{provided => (
				<div ref={provided.innerRef} {...provided.droppableProps}>
					{items.map((item, index) => (
						<RotationItemView key={item.key} item={item} index={index} />
					))}
					{provided.placeholder}
				</div>
			)}
		</Droppable>
	)
}

interface RotationItemViewProps {
	index: number
	item: RotationItem
}

function RotationItemView({index, item}: RotationItemViewProps) {
	return (
		<Draggable
			// todo this but properly
			draggableId={item.key}
			index={index}
		>
			{provided => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
				>
					{/* todo switch between types */}
					<Tooltip sheet="Action" id={item.action} />
				</div>
			)}
		</Draggable>
	)
}
