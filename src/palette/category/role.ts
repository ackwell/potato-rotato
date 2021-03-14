import {fetchXivapi, XivApiListing} from '../../xivapi'
import {Job} from '../jobSelect'
import {ActionCategory} from './base'

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
	).map(action => ({id: action.ID}))
}

export function getRoleCategory(job: Job): ActionCategory {
	return {
		name: 'Role Actions',
		fetchActions: () => fetchActions(job),
	}
}
