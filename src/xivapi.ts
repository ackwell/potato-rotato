import {useEffect, useState} from 'react'

interface XivApiListing<T> {
	Results: T[]
}

const fetchXivapi = <T = any>(request: string): Promise<T> =>
	fetch(`https://xivapi.com/${request}`).then(resp => resp.json())

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
			'ClassJob?columns=ID,Name,ClassJobParentTargetID,ItemSoulCrystalTargetID',
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

// The ActionIndirection sheet provides overrides for Action.ClassJob, seemingly used to
// adjust what's displayed in the Actions & Traits menu. It's a tiny sheet, eagerly fetch
// and process, we'll use it when retrieving actions for a job
interface XivApiActionIndirection {
	NameTargetID: number
	ClassJobTargetID: number | '-1'
}

const actionIndirectionData = fetchXivapi(
	'ActionIndirection?columns=NameTargetID,ClassJobTargetID',
).then((json: XivApiListing<XivApiActionIndirection>) => {
	const hide = new Set<number>()
	const extras = new Map<number, number[]>()

	for (const {ClassJobTargetID: job, NameTargetID: action} of json.Results) {
		if (job === '-1') {
			hide.add(action)
			continue
		}

		let jobExtras = extras.get(job)
		if (jobExtras == null) {
			jobExtras = []
			extras.set(job, jobExtras)
		}
		jobExtras.push(action)
	}

	return {hide, extras}
})

interface XivApiAction {
	ID: number
}

export interface Action {
	id: number
}

export async function getJobActions(job: Job): Promise<Action[]> {
	const filters = [`ClassJob.ID|=${job.id};${job.parentId}`].join(',')

	const [{hide, extras}, json] = await Promise.all([
		actionIndirectionData,
		fetchXivapi<XivApiListing<XivApiAction>>(
			`search?indexes=action&filters=${filters}&columns=ID`,
		),
	])

	return [
		...json.Results.map(action => action.ID),
		...(extras.get(job.id) ?? []),
		...(job.parentId !== job.id ? extras.get(job.parentId) ?? [] : []),
	]
		.filter(id => !hide.has(id))
		.map(id => ({id}))
}
