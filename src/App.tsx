import {ChangeEvent, useCallback, useState} from 'react'
import {Action, Job, useJobActions, useJobs} from './xivapi'

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

interface JobSelectProps {
	value?: Job
	onChange?: (job: Job) => void
}

function JobSelect({value, onChange}: JobSelectProps) {
	const jobs = useJobs()

	const onSelectChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			const value = parseInt(event.currentTarget.value, 10)
			const job = jobs?.find(job => job.id === value)
			job != null && onChange?.(job)
		},
		[jobs, onChange],
	)

	return (
		<select onChange={onSelectChange} value={value?.id ?? 'none'}>
			<option disabled value="none">
				{jobs == null ? 'Loading' : 'Select a job'}
			</option>
			{jobs?.map(job => (
				<option key={job.id} value={job.id}>
					{job.name}
				</option>
			))}
		</select>
	)
}

interface RotationProps {
	actions: Action[]
}

function Rotation({actions}: RotationProps) {
	return (
		<ul>
			{actions.map((action, index) => (
				<li key={index}>{action.name}</li>
			))}
		</ul>
	)
}

interface PaletteProps {
	job: Job
	onClickAction?: (action: Action) => void
}

function Palette({job, onClickAction}: PaletteProps) {
	const actions = useJobActions(job)

	return (
		<>
			{actions == null && <>loading</>}
			{actions != null && (
				<ul>
					{actions.map(action => (
						<li key={action.id} onClick={() => onClickAction?.(action)}>
							{action.name}
						</li>
					))}
				</ul>
			)}
		</>
	)
}
