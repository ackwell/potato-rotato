import {Tooltip} from '@xivanalysis/tooltips'
import {Draggable, Droppable} from 'react-beautiful-dnd'
import {Action, Job, useJobActions} from './xivapi'

export const PALETTE_DROPPABLE = 'palette'

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
				<Droppable droppableId={PALETTE_DROPPABLE} isDropDisabled={true}>
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
						<Tooltip sheet="Action" id={action.id} />
					</div>
					{snapshot.isDragging && <Tooltip sheet="Action" id={action.id} />}
				</>
			)}
		</Draggable>
	)
}
