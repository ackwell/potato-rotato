import {useState} from 'react'
import {JobSelect} from './JobSelect'
import {Palette} from './Palette'
import {Rotation} from './Rotation'
import {Action, Job} from './xivapi'

export function App() {
	const [job, setJob] = useState<Job>()
	const [rotation, setRotation] = useState<Action[]>([])

	const appendAction = (action: Action) =>
		setRotation(rotation => [...rotation, action])

	return (
		<>
			<h1>rotato</h1>
			<JobSelect value={job} onChange={setJob} />
			<hr />
			<Rotation actions={rotation} />
			<hr />
			{job && <Palette job={job} onClickAction={appendAction} />}
		</>
	)
}
