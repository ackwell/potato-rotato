import {fetchXivapi, XivApiListing} from '../../xivapi'
import {Job} from '../jobSelect'
import {ActionCategory} from './base'

interface XivApiAction {
	ID: number
	ClassJobLevel: number
}

export async function fetchRoleCategories(job: Job): Promise<ActionCategory[]> {
	const filters = [
		`ClassJobCategory.${job.classJobCategoryKey}=1`,
		'IsRoleAction=1',
		'IsPvP=0',
	].join(',')

	const {Results} = await fetchXivapi<XivApiListing<XivApiAction>>(
		`search?indexes=action&filters=${filters}`,
	)

	return [
		{
			name: 'Role Actions',
			actions: Results.sort(
				(a, b) => a.ClassJobLevel - b.ClassJobLevel,
			).map(action => ({id: action.ID})),
		},
	]
}
