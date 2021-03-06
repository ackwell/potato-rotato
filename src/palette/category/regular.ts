import {ItemType} from '../../state'
import {fetchXivapi, XivApiListing} from '../../xivapi'
import {Job} from '../jobSelect'
import {Category} from './base'

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

interface XivApiAction {
	ID: number
	ClassJobLevel: number
}

async function fetchActionIndirection() {
	const json = await fetchXivapi<XivApiListing<XivApiActionIndirection>>(
		'ActionIndirection?limit=500&columns=Name,ClassJobTargetID',
	)
	const hide = new Set<number>()
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
		jobExtras.push({...action})
	}

	return {hide, extras}
}

async function fetchRegularActions(job: Job) {
	const filters = [
		// ARR jobs use skills from their parent job
		`ClassJobTargetID|=${job.id};${job.parentId}`,
		// ...except SCH, which doesn't use a few
		`ClassJobCategory.${job.classJobCategoryKey}=1`,
		// PvP is handled seperately, ignore.
		'IsPvP=0',
	].join(',')

	return fetchXivapi<XivApiListing<XivApiAction>>(
		`search?indexes=action&filters=${filters}&columns=ID,ClassJobLevel`,
	).then(results => results.Results)
}

let indirectionCache: ReturnType<typeof fetchActionIndirection> | undefined
const regularActionCache = new Map<
	number,
	ReturnType<typeof fetchRegularActions>
>()

async function fetchActions(job: Job) {
	if (indirectionCache == null) {
		indirectionCache = fetchActionIndirection()
	}

	let jobActionPromise = regularActionCache.get(job.id)
	if (jobActionPromise == null) {
		jobActionPromise = fetchRegularActions(job)
		regularActionCache.set(job.id, jobActionPromise)
	}

	const [regularActions, {hide, extras}] = await Promise.all([
		jobActionPromise,
		indirectionCache,
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

	// TODO: Split GCD/OGCD?

	return actions.map(action => ({type: ItemType.ACTION, action: action.ID}))
}

export function getRegularCategory(job: Job): Category {
	return {
		name: 'Actions',
		fetchItems: () => fetchActions(job),
	}
}
