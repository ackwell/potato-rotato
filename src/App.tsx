import {useState} from 'react'
import {JobSelect} from './JobSelect'
import {Palette} from './Palette'
import {Rotation, RotationContext} from './Rotation'
import {Job} from './xivapi'

export function App() {
	const [job, setJob] = useState<Job>()

	return (
		<>
			<h1>rotato</h1>
			<RotationContext>
				<Rotation />
				<hr />
				<JobSelect value={job} onChange={setJob} />
				<hr />
				{job && <Palette job={job} />}
			</RotationContext>
		</>
	)
}
