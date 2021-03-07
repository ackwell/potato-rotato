import {useEffect, useState} from 'react'

interface XivApiListing<T> {
	Results: T[]
}

interface XivApiJob {
	ID: number
	Name: string
	ClassJobParentTargetID: number
	ItemSoulCrystalTargetID: number
}

export interface Job {
	id: number
	name: string
	parentId: number
}

export function useJobs() {
	const [jobs, setJobs] = useState<Job[]>()
	useEffect(() => {
		fetchXivapi<XivApiListing<XivApiJob>>(
			'classjob?columns=ID,Name,ClassJobParentTargetID,ItemSoulCrystalTargetID',
		).then(json => {
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

interface XivApiAction {
	ID: number
}

export interface Action {
	id: number
}

export async function getJobActions(job: Job): Promise<Action[]> {
	// TODO: Handle PvP
	// TODO: Handle crafters?
	return fetchXivapi(
		`search?indexes=action&filters=ClassJob.ID|=${job.id};${job.parentId}&columns=ID`,
	).then((json: XivApiListing<XivApiAction>) =>
		json.Results.map(action => ({id: action.ID})),
	)
}

const fetchXivapi = <T = any>(request: string): Promise<T> =>
	fetch(`https://xivapi.com/${request}`).then(resp => resp.json())
