import {Draggable, Droppable} from 'react-beautiful-dnd'
import {Action, Job, useJobActions} from './xivapi'

// todo: readd click to append?
export interface PaletteProps {
	job: Job
}

export function Palette({job}: PaletteProps) {
	const actions = useJobActions(job)

	return (
		<>
			{actions == null && <>loading</>}
			{actions != null && (
				<Droppable droppableId="palette" isDropDisabled={true}>
					{provided => (
						<div ref={provided.innerRef} {...provided.droppableProps}>
							{actions.map((action, index) => (
								<PaletteAction key={action.id} index={index} action={action} />
							))}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			)}
		</>
	)
}

interface PaletteActionProps {
	index: number
	action: Action
}

function PaletteAction({index, action}: PaletteActionProps) {
	return (
		// todo abstract dnd stuff
		<Draggable draggableId={`${action.id}`} index={index}>
			{(provided, snapshot) => (
				<>
					<div
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						style={{
							...provided.draggableProps.style,
							transform: snapshot.isDragging
								? provided.draggableProps.style?.transform
								: 'translate(0px, 0px)',
						}}
					>
						{action.name}
					</div>
					{snapshot.isDragging && <div>{action.name}</div>}
				</>
			)}
		</Draggable>
	)
}
