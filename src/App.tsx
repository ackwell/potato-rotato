import {ChangeEvent, useCallback, useState} from 'react'
import {Job, useJobActions, useJobs} from './xivapi'

export function App() {
	const [job, setJob] = useState<Job>()
	return (
		<>
			<h1>rotato</h1>
			<JobSelect value={job} onChange={setJob} />
			<hr />
			{job && <ActionList job={job} />}
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

interface ActionListProps {
	job: Job
}

function ActionList({job}: ActionListProps) {
	const actions = useJobActions(job)

	return (
		<>
			{actions == null && <>loading</>}
			{actions != null && (
				<ul>
					{actions.map(action => (
						<li key={action.id}>{action.name}</li>
					))}
				</ul>
			)}
		</>
	)
}
