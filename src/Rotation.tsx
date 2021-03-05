import {atom, useAtom} from 'jotai'
import {useUpdateAtom} from 'jotai/utils'
import {useCallback} from 'react'
import {
	DragDropContext,
	Draggable,
	Droppable,
	DropResult,
} from 'react-beautiful-dnd'

export type RotationItem = {type: 'action'; id: number}

const rotationAtom = atom<RotationItem[]>([])

interface RotationContextProps {
	children?: React.ReactNode
}

function insert<T extends any>(input: T[], index: number, toInsert: T) {
	const output = input.slice()
	output.splice(index, 0, toInsert)
	return output
}

export function RotationContext({children}: RotationContextProps) {
	const setRotation = useUpdateAtom(rotationAtom)

	const onDragEnd = useCallback(
		({draggableId, destination}: DropResult) => {
			// todo check source, will need diff handling depending on source
			// todo we'll want more than purely actions, figure out ids in a non-meme way
			setRotation(rotation =>
				insert(rotation, destination?.index ?? 0, {
					type: 'action',
					id: parseInt(draggableId, 10),
				}),
			)
		},
		[setRotation],
	)

	return <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>
}

export function Rotation() {
	const [items] = useAtom(rotationAtom)

	return (
		<Droppable droppableId="rotation">
			{provided => (
				<div ref={provided.innerRef} {...provided.droppableProps}>
					{items.map((item, index) => (
						<RotationItemView key={index} item={item} index={index} />
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
			draggableId={`bullshit-tofix-${index}`}
			index={index}
			// todo remove below, its just to fix immediate term breaks
			isDragDisabled={true}
		>
			{provided => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
				>
					{item.type} {item.id}
				</div>
			)}
		</Draggable>
	)
}
