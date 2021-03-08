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
	ClassJobLevel: number
	IsPvP: 0 | 1
}

export interface Action {
	id: number
	level: number
	pvp: boolean
	pvpOrder?: number
}

const buildAction = (input: XivApiAction): Action => ({
	id: input.ID,
	level: input.ClassJobLevel,
	pvp: input.IsPvP > 0,
})

// The ActionIndirection sheet provides overrides for Action.ClassJob, seemingly used to
// adjust what's displayed in the Actions & Traits menu. It's a tiny sheet, eagerly fetch
// and process, we'll use it when retrieving actions for a job
interface XivApiActionIndirection {
	Name: {
		ID: number
		ClassJobLevel: number
		IsPvP: 0 | 1
	}
	ClassJobTargetID: number | '-1'
}

const actionIndirectionData = fetchXivapi(
	'ActionIndirection?columns=Name.ID,Name.ClassJobLevel,Name.IsPvP,ClassJobTargetID',
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
// TODO: Should do this lazily?
interface XivApiPvPActionSort {
	ID: string
	// Currently called Name, but I _just_ PR'd a rename, so let's support both lmao
	Name?: number
	ActionType?: number
	ActionTargetID: number
}

const pvpActionSortData = fetchXivapi(
	'PvPActionSort?limit=1000&columns=ID,Name,ActionType,ActionTargetID',
).then((json: XivApiListing<XivApiPvPActionSort>) => {
	const orders = new Map<number, number>()

	for (const result of json.Results) {
		// Non-1 ActionType values link to other tables, ignore
		const actionType = result.ActionType ?? result.Name
		if (actionType !== 1) {
			continue
		}

		// Table uses subrows. One row per job, one subrow per action, in order of display
		const [, sortOrder] = result.ID.split('.')
		orders.set(result.ActionTargetID, parseInt(sortOrder, 10))
	}

	return {orders}
})

export async function getJobActions(job: Job): Promise<Action[]> {
	// TODO: Can check GameContentLinks.PvPActionSort!! for actions with IsPvP i think
	const filters = [
		`ClassJob.ID|=${job.id};${job.parentId}`,
		`ClassJobCategory.${job.classJobCategoryKey}=1`,
	].join(',')

	const [indirection, pvpSort, json] = await Promise.all([
		actionIndirectionData,
		pvpActionSortData,
		fetchXivapi<XivApiListing<XivApiAction>>(
			`search?indexes=action&filters=${filters}&columns=ID,ClassJobLevel,IsPvP`,
		),
	])

	const jobActions = json.Results.filter(action => {
		// Regular actions hidden by indirection
		if (indirection.hide.has(action.ID)) {
			return false
		}

		// PvP actions must be in pvp sort
		if (action.IsPvP > 0 && !pvpSort.orders.has(action.ID)) {
			return false
		}

		return true
	}).map(action => {
		const output = buildAction(action)
		const pvpOrder = pvpSort.orders.get(action.ID)
		if (pvpOrder) {
			output.pvpOrder = pvpOrder
		}
		return output
	})

	return [
		...jobActions,
		...(indirection.extras.get(job.id) ?? []),
		...(job.parentId !== job.id
			? indirection.extras.get(job.parentId) ?? []
			: []),
	]
}
