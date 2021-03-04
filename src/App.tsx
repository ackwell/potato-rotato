import {ChangeEvent, useCallback, useEffect, useState} from 'react'

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

interface XivApiListing<T> {
	Results: T[]
}

interface XivApiJob {
	ID: number
	Name: string
	ClassJobParentTargetID: number
	ItemSoulCrystalTargetID: number
}

interface Job {
	id: number
	name: string
	parentId: number
}

function useJobs() {
	const [jobs, setJobs] = useState<Job[]>()
	useEffect(() => {
		fetch(
			'https://xivapi.com/classjob?columns=ID,Name,ClassJobParentTargetID,ItemSoulCrystalTargetID',
		)
			.then(resp => resp.json())
			.then((json: XivApiListing<XivApiJob>) => {
				setJobs(
					json.Results.filter(job => job.ItemSoulCrystalTargetID > 0).map(
						job => ({
							id: job.ID,
							name: job.Name,
							parentId: job.ClassJobParentTargetID,
						}),
					),
				)
			})
	}, [])
	return jobs
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

interface XivApiAction {
	ID: number
	Name: string
}

interface Action {
	id: number
	name: string
}

function useJobActions(job: Job) {
	const [actions, setActions] = useState<Action[]>()
	useEffect(() => {
		const jobIds = [job.id, job.parentId].join(';')
		fetch(
			`https://xivapi.com/search?indexes=action&filters=ClassJob.ID|=${jobIds}&columns=ID,Name`,
		)
			.then(resp => resp.json())
			.then((json: XivApiListing<XivApiAction>) =>
				setActions(
					json.Results.map(action => ({id: action.ID, name: action.Name})),
				),
			)
		return () => setActions(undefined)
	}, [job])
	return actions
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
