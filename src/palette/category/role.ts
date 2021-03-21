import {ItemType} from '../../state'
import {fetchXivapi, XivApiListing} from '../../xivapi'
import {Job} from '../jobSelect'
import {Category} from './base'

interface XivApiAction {
	ID: number
	ClassJobLevel: number
}

async function fetchActions(job: Job) {
	const filters = [
		`ClassJobCategory.${job.classJobCategoryKey}=1`,
		'IsRoleAction=1',
		'IsPvP=0',
	].join(',')

	const {Results} = await fetchXivapi<XivApiListing<XivApiAction>>(
		`search?indexes=action&filters=${filters}&columns=ID,ClassJobLevel`,
	)

	return Results.sort(
		(a, b) => a.ClassJobLevel - b.ClassJobLevel,
	).map(action => ({type: ItemType.ACTION, action: action.ID}))
}

const actionCache = new Map<number, ReturnType<typeof fetchActions>>()

export function getRoleCategory(job: Job): Category {
	return {
		name: 'Role Actions',
		fetchItems: () => {
			let promise = actionCache.get(job.id)
			if (promise == null) {
				promise = fetchActions(job)
				actionCache.set(job.id, promise)
			}
			return promise
		},
	}
}
