import {fetchXivapi, XivApiListing} from '../../xivapi'
import {Job} from '../jobSelect'
import {Action, ActionCategory} from './base'

// MYCTemporaryItem contains all the data for "Lost" items and actions available in Save The Queen areas
interface XivApiMYCTemporaryItem {
	Order: number
	CategoryTargetID: number
	Action: {
		ID: number
		// TODO: This isn't entirely accurate but whatever
		ClassJobCategory: Record<string, 0 | 1>
	}
}

interface BozjaAction extends Action {
	order: number
}

async function fetchAllData() {
	const json = await fetchXivapi<XivApiListing<XivApiMYCTemporaryItem>>(
		`MYCTemporaryItem?limit=500&columns=Order,CategoryTargetID,Action.ID,Action.ClassJobCategory`,
	)
	const jobGroups = new Map<string, BozjaAction[]>()

	// This is copypasta from pvp, might be able to dedupe a bit i guess
	for (const result of json.Results) {
		const action = {
			id: result.Action.ID,
			order: result.Order + result.CategoryTargetID * 1000,
		}

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

export function getBozjaCategory(job: Job): ActionCategory {
	return {
		name: 'Lost Actions',
		fetchActions: () => fetchActions(job),
	}
}
