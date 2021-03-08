import {useEffect, useState} from 'react'

// TODO: might be able to just... steal the column system from tooltips to make defining the response shapes less horrible
// Realistically, most of this logic is only relevant to a single component that uses it. This file should be cut back to just xivapi generic utilities,
// with component specific lookup logic moved to that component/package.

interface XivApiListing<T> {
	Results: T[]
}

// TODO: Handle listing pagination?
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
	ClassJobLevel?: number
}

export interface Action {
	id: number
	level: number
	pvpOrder?: number
}

const buildAction = (input: XivApiAction): Action => ({
	id: input.ID,
	level: input.ClassJobLevel ?? 0,
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
	'ActionIndirection?limit=500&columns=Name.ID,Name.ClassJobLevel,ClassJobTargetID',
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

// PvPActionSort provides the sorting used in the pvp actions window, useful as all
// pvp actions have no class job level to sort off. In addition, entries not found
// in the table can be assumed to be hidden.
interface XivApiPvPActionSort {
	ID: string
	// Currently called Name, but I _just_ PR'd a rename, so let's support both lmao
	Name?: number
	ActionType?: number
	Action: {
		ID: number
		// TODO: This isn't entirely accurate but whatever
		ClassJobCategory: Record<string, 0 | 1>
	}
}

const pvpActionSortData = fetchXivapi(
	'PvPActionSort?limit=1000&columns=ID,Name,ActionType,Action.ID,Action.ClassJobCategory',
).then((json: XivApiListing<XivApiPvPActionSort>) => {
	// Sheet stores values separately for every job, so shared actions will be duped. Ignore dupes.
	// TODO: This is nuking sortOrder for some actions that are shared. Once Miu merges PvPActionSortRow we'll be able to use it to clean up a bit.
	const seen = new Set<number>()
	const jobGroups = new Map<string, Action[]>()

	for (const result of json.Results) {
		// Non-1 ActionType values link to other tables, ignore
		const actionType = result.ActionType ?? result.Name
		if (actionType !== 1) {
			continue
		}

		if (seen.has(result.Action.ID)) {
			continue
		}
		seen.add(result.Action.ID)

		// Table uses subrows. One row per job, one subrow per action, in order of display
		const action = buildAction(result.Action)
		const [, sortOrder] = result.ID.split('.')
		action.pvpOrder = parseInt(sortOrder, 10)

		// Some PVP Actions are shared between classes, grabbem' all
		const jobs = Object.keys(result.Action.ClassJobCategory).filter(
			key => result.Action.ClassJobCategory[key] === 1,
		)
		for (const job of jobs) {
			let jobActions = jobGroups.get(job)
			if (jobActions == null) {
				jobActions = []
				jobGroups.set(job, [])
			}
			jobActions.push(action)
		}
	}

	return {jobGroups}
})

export async function getJobActions(job: Job): Promise<Action[]> {
	const filters = [
		`ClassJob.ID|=${job.id};${job.parentId}`,
		`ClassJobCategory.${job.classJobCategoryKey}=1`,
		'IsPvP=0',
	].join(',')

	const [indirection, pvpSort, regularActions] = await Promise.all([
		actionIndirectionData,
		pvpActionSortData,
		fetchXivapi<XivApiListing<XivApiAction>>(
			`search?indexes=action&filters=${filters}&columns=ID,ClassJobLevel`,
		),
	])

	const jobActions = regularActions.Results.filter(
		action => !indirection.hide.has(action.ID),
	).map(buildAction)

	return [
		...jobActions,
		...(indirection.extras.get(job.id) ?? []),
		...(job.parentId !== job.id
			? indirection.extras.get(job.parentId) ?? []
			: []),
		...(pvpSort.jobGroups.get(job.classJobCategoryKey) ?? []),
	]
}
