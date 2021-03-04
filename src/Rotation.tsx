import {Action} from './xivapi'

export interface RotationProps {
	actions: Action[]
}

export function Rotation({actions}: RotationProps) {
	return (
		<ul>
			{actions.map((action, index) => (
				<li key={index}>{action.name}</li>
			))}
		</ul>
	)
}
