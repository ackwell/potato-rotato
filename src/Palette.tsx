import {Action, Job, useJobActions} from './xivapi'

export interface PaletteProps {
	job: Job
	onClickAction?: (action: Action) => void
}

export function Palette({job, onClickAction}: PaletteProps) {
	const actions = useJobActions(job)

	return (
		<>
			{actions == null && <>loading</>}
			{actions != null && (
				<ul>
					{actions.map(action => (
						<li key={action.id} onClick={() => onClickAction?.(action)}>
							{action.name}
						</li>
					))}
				</ul>
			)}
		</>
	)
}
