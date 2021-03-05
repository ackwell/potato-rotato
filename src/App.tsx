import {useState} from 'react'
import {DragDropContext, DropResult} from 'react-beautiful-dnd'
import {JobSelect} from './JobSelect'
import {Palette} from './Palette'
import {Rotation, RotationItem} from './Rotation'
import {Action, Job} from './xivapi'

// todo this isn't gonna be the best perf with all this rerender

export function App() {
	const [job, setJob] = useState<Job>()
	const [rotation, setRotation] = useState<RotationItem[]>([])

	// todo reconsider api around onclickaction
	const appendAction = (action: Action) =>
		setRotation(rotation => [...rotation, {type: 'action', id: action.id}])

	const insertAction = (id: number, index: number) =>
		setRotation(rotation => {
			const result = rotation.slice()
			result.splice(index, 0, {type: 'action', id})
			return result
		})

	const onDragEnd = (dropResult: DropResult) => {
		// todo check source, will need diff handling depending on source
		// todo we'll want more than purely actions, figure out ids in a non-meme way
		insertAction(
			parseInt(dropResult.draggableId, 10),
			dropResult.destination?.index ?? 0,
		)
	}

	return (
		<>
			<h1>rotato</h1>
			<DragDropContext onDragEnd={onDragEnd}>
				<Rotation items={rotation} />
				<hr />
				<JobSelect value={job} onChange={setJob} />
				<hr />
				{job && <Palette job={job} onClickAction={appendAction} />}
			</DragDropContext>
		</>
	)
}
