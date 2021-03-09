import {fetchXivapi, Job, XivApiListing} from '../../xivapi'
import {ActionCategory} from './base'

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
	'ActionIndirection?limit=500&columns=Name,ClassJobTargetID',
).then((json: XivApiListing<XivApiActionIndirection>) => {
	const hide = new Set<number>()
	// TODO: We're filtering later anyway, do we need this as a map?
	const extras = new Map<number, XivApiAction[]>()

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
		jobExtras.push({...action, ClassJobTargetID: job})
	}

	return {hide, extras}
})

interface XivApiAction {
	ID: number
	ClassJobTargetID: number
	ClassJobLevel: number
}

export async function fetchRegularCategories(
	job: Job,
): Promise<ActionCategory[]> {
	const filters = [
		// ARR jobs use skills from their parent job
		`ClassJobTargetID|=${job.id};${job.parentId}`,
		// ...except SCH, which doesn't use a few
		`ClassJobCategory.${job.classJobCategoryKey}=1`,
		// PvP is handled seperately, ignore.
		'IsPvP=0',
	].join(',')

	const [{Results: regularActions}, {hide, extras}] = await Promise.all([
		fetchXivapi<XivApiListing<XivApiAction>>(
			`search?indexes=action&filters=${filters}&columns=ID,ClassJobTargetID,ClassJobLevel`,
		),
		actionIndirectionData,
	])

	const actions: XivApiAction[] = [
		...regularActions.filter(action => !hide.has(action.ID)),
	]
	if (job.parentId !== job.id) {
		actions.push(...(extras.get(job.parentId) ?? []))
	}
	actions.push(...(extras.get(job.id) ?? []))
	actions.sort((a, b) => a.ClassJobLevel - b.ClassJobLevel)

	// TODO: Pet?
	// TODO: Role actions

	// TODO: Split GCD/OGCD
	return [
		{
			name: 'Actions',
			actions: actions.map(action => ({id: action.ID})),
		},
	]
}
