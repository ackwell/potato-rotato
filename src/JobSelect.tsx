import {ChangeEvent, useCallback} from 'react'
import {Job, useJobs} from './xivapi'

export interface JobSelectProps {
	value?: Job
	onChange?: (job: Job) => void
}

export function JobSelect({value, onChange}: JobSelectProps) {
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
