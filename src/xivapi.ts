import {useEffect, useState} from 'react'
import {UnreachableError} from './util'

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
	const filter = buildFilter([
		{column: 'ClassJob.ID', op: '|=', values: [job.id, job.parentId]},
	])
	return fetch(
		`https://xivapi.com/search?indexes=action&filters=${filter}&columns=ID`,
	)
		.then(resp => resp.json())
		.then((json: XivApiListing<XivApiAction>) =>
			json.Results.map(action => ({id: action.ID})),
		)
}

const fetchXivapi = <T = any>(request: string): Promise<T> =>
	fetch(`https://xivapi.com/${request}`).then(resp => resp.json())

// this is probably overkill. remove?
type Filter = {column: string} & {op: '|='; values: unknown[]}

const buildFilter = (filters: Filter[]): string =>
	filters.map(translateFilterValue).join(',')

function translateFilterValue(filter: Filter): string {
	switch (filter.op) {
		case '|=':
			return `${filter.column}${filter.op}${filter.values.join(';')}`
		default:
			throw new UnreachableError(filter.op)
	}
}
