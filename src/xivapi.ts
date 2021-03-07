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
	Abbreviation_en: string
}

export interface Job {
	id: number
	name: string
	parentId: number
	classJobCategoryKey: string
}

export function useJobs() {
	const [jobs, setJobs] = useState<Job[]>()
	useEffect(() => {
		fetchXivapi<XivApiListing<XivApiJob>>(
			'ClassJob?columns=ID,Name,ClassJobParentTargetID,ItemSoulCrystalTargetID,Abbreviation_en',
		).then(json => {
			setJobs(
				json.Results.filter(job => job.ItemSoulCrystalTargetID > 0).map(
					job => ({
						id: job.ID,
						name: job.Name,
						parentId: job.ClassJobParentTargetID,
						// This is a relatively tenuous link. Blame miu if it breaks.
						classJobCategoryKey: job.Abbreviation_en,
					}),
				),
			)
		})
	}, [])
	return jobs
}

interface XivApiAction {
	ID: number
	ClassJobLevel: number
}

export interface Action {
	id: number
	level: number
}

const buildAction = (input: XivApiAction): Action => ({
	id: input.ID,
	level: input.ClassJobLevel,
})

// The ActionIndirection sheet provides overrides for Action.ClassJob, seemingly used to
// adjust what's displayed in the Actions & Traits menu. It's a tiny sheet, eagerly fetch
// and process, we'll use it when retrieving actions for a job
interface XivApiActionIndirection {
	Name: {
		ID: number
		ClassJobLevel: number
	}
	ClassJobTargetID: number | '-1'
}

const actionIndirectionData = fetchXivapi(
	'ActionIndirection?columns=Name.ID,Name.ClassJobLevel,ClassJobTargetID',
).then((json: XivApiListing<XivApiActionIndirection>) => {
	const hide = new Set<number>()
	const extras = new Map<number, Action[]>()

	for (const {ClassJobTargetID: job, Name: action} of json.Results) {
		if (job === '-1') {
			hide.add(action.ID)
			continue
		}

		let jobExtras = extras.get(job)
		if (jobExtras == null) {
			jobExtras = []
			extras.set(job, jobExtras)
		}
		jobExtras.push(buildAction(action))
	}

	return {hide, extras}
})

export async function getJobActions(job: Job): Promise<Action[]> {
	const filters = [
		`ClassJob.ID|=${job.id};${job.parentId}`,
		`ClassJobCategory.${job.classJobCategoryKey}=1`,
	].join(',')

	const [{hide, extras}, json] = await Promise.all([
		actionIndirectionData,
		fetchXivapi<XivApiListing<XivApiAction>>(
			`search?indexes=action&filters=${filters}&columns=ID,ClassJobLevel`,
		),
	])

	// Should the sort be here or in component space? Tempted to say the latter tbqh
	return [
		...json.Results.filter(action => !hide.has(action.ID)).map(buildAction),
		...(extras.get(job.id) ?? []),
		...(job.parentId !== job.id ? extras.get(job.parentId) ?? [] : []),
	].sort((a, b) => a.level - b.level)
}
