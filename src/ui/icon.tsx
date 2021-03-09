import {ActionData} from '../data'

// TODO: Should probably make base path configurable. pull from tooltip lib config, or...?
// macro ? icon
const ACTION_ICON_FALLBACK = 'https://xivapi.com/i/066000/066313.png'
const ACTION_ICON_SIZE = 40

export interface ActionIconProps {
	action?: ActionData
}

export function ActionIcon({action}: ActionIconProps) {
	// We explicitly set the size of the image so it can retain dimensions while the image loads
	return (
		<img
			width={ACTION_ICON_SIZE}
			height={ACTION_ICON_SIZE}
			src={action?.icon ?? ACTION_ICON_FALLBACK}
			alt={action?.name}
		/>
	)
}
