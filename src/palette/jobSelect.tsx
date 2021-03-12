import {ChangeEvent, useCallback, useEffect, useState} from 'react'
import {Heading} from '../ui'
import {fetchXivapi, XivApiListing} from '../xivapi'
import styles from './jobSelect.module.css'

export interface Job {
	id: number
	name: string
	parentId: number
	classJobCategoryKey: string
}

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
		<div className={styles.container}>
			<Heading>Job:</Heading>&nbsp;
			<select
				onChange={onSelectChange}
				value={value?.id ?? 'none'}
				className={styles.select}
			>
				<option disabled value="none">
					{jobs == null ? 'Loading' : 'Select a job'}
				</option>
				{jobs?.map(job => (
					<option key={job.id} value={job.id}>
						{job.name}
					</option>
				))}
			</select>
		</div>
	)
}

interface XivApiJob {
	ID: number
	Name: string
	ClassJobParentTargetID: number
	ItemSoulCrystalTargetID: number
	DohDolJobIndex: number | '-1'
	Abbreviation_en: string
}

function useJobs() {
	const [jobs, setJobs] = useState<Job[]>()
	useEffect(() => {
		fetchXivapi<XivApiListing<XivApiJob>>(
			'ClassJob?columns=ID,Name,ClassJobParentTargetID,ItemSoulCrystalTargetID,DohDolJobIndex,Abbreviation_en',
		).then(json => {
			setJobs(
				json.Results.filter(
					job => job.ItemSoulCrystalTargetID > 0 && job.DohDolJobIndex === '-1',
				).map(job => ({
					id: job.ID,
					name: job.Name,
					parentId: job.ClassJobParentTargetID,
					// This is a relatively tenuous link. Blame miu if it breaks.
					classJobCategoryKey: job.Abbreviation_en,
				})),
			)
		})
	}, [])
	return jobs
}
