import {Draggable, Droppable} from 'react-beautiful-dnd'

export type RotationItem = {type: 'action'; id: number}

export interface RotationProps {
	items: RotationItem[]
}

export function Rotation({items}: RotationProps) {
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
