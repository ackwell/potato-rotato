import {ChangeEvent, useCallback, useEffect, useState} from 'react'

export function App() {
	const [job, setJob] = useState<Job>()
	return (
		<>
			<h1>rotato</h1>
			<JobSelect value={job} onChange={setJob} />
		</>
	)
}

interface XivApiListing<T> {
	Results: T[]
}

interface XivApiJob {
	ID: number
	Name: string
	ItemSoulCrystalTargetID: number
}

interface Job {
	id: number
	name: string
}

function useJobs() {
	const [jobs, setJobs] = useState<Job[]>()
	useEffect(() => {
		fetch('https://xivapi.com/classjob?columns=ID,Name,ItemSoulCrystalTargetID')
			.then(resp => resp.json())
			.then((json: XivApiListing<XivApiJob>) => {
				setJobs(
					json.Results.filter(
						job => job.ItemSoulCrystalTargetID > 0,
					).map(job => ({id: job.ID, name: job.Name})),
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
