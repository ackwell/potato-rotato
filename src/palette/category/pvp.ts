import {fetchXivapi, XivApiListing} from '../../xivapi'
import {Job} from '../jobSelect'
import {Action, ActionCategory} from './base'

// PvPActionSort provides the sorting used in the pvp actions window, useful as all
// pvp actions have no class job level to sort off. In addition, entries not found
// in the table can be assumed to be hidden.
interface XivApiPvPActionSort {
	ID: string
	// Currently called Name, but I _just_ PR'd a rename, so let's support both lmao
	// TODO: Remove Name
	Name?: number
	ActionType?: number
	Action: {
		ID: number
		// TODO: This isn't entirely accurate but whatever
		ClassJobCategory: Record<string, 0 | 1>
	}
}

interface PvpAction extends Action {
	order: number
}

async function fetchAllData() {
	const json = await fetchXivapi<XivApiListing<XivApiPvPActionSort>>(
		'PvPActionSort?limit=1000&columns=ID,Name,ActionType,Action.ID,Action.ClassJobCategory',
	)
	// Sheet stores values separately for every job, so shared actions will be duped. Ignore dupes.
	// TODO: This is nuking sortOrder for some actions that are shared. Once Miu merges PvPActionSortRow we'll be able to use it to clean up a bit.
	const seen = new Set<number>()
	const jobGroups = new Map<string, PvpAction[]>()

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
		const [, sortOrder] = result.ID.split('.')
		const action = {
			id: result.Action.ID,
			order: parseInt(sortOrder, 10),
		}

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

	// Sort 'em all
	for (const actions of jobGroups.values()) {
		actions.sort((a, b) => a.order - b.order)
	}

	return {jobGroups}
}

let dataCache: ReturnType<typeof fetchAllData> | undefined
async function fetchActions(job: Job) {
	if (dataCache == null) {
		dataCache = fetchAllData()
	}

	const {jobGroups} = await dataCache

	return jobGroups.get(job.classJobCategoryKey) ?? []
}

export function getPvpCategory(job: Job): ActionCategory {
	return {
		name: 'PvP Actions',
		fetchActions: () => fetchActions(job),
	}
}
