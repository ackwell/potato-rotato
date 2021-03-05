import {Draggable, Droppable} from 'react-beautiful-dnd'
import {Action, Job, useJobActions} from './xivapi'

export interface PaletteProps {
	job: Job
	onClickAction?: (action: Action) => void
}

export function Palette({job, onClickAction}: PaletteProps) {
	const actions = useJobActions(job)

	return (
		<>
			{actions == null && <>loading</>}
			{actions != null && (
				<Droppable droppableId="palette" isDropDisabled={true}>
					{provided => (
						<div ref={provided.innerRef} {...provided.droppableProps}>
							{actions.map((action, index) => (
								<div key={action.id} onClick={() => onClickAction?.(action)}>
									<PaletteAction index={index} action={action} />
								</div>
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
