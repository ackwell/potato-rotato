import {ActionData} from '../data'
import {API_HOST} from '../xivapi'
import styles from './icon.module.css'

// TODO: Should probably make base path configurable. pull from tooltip lib config, or...?
// macro ? icon
const ACTION_ICON_FALLBACK = `${API_HOST}/i/066000/066313.png`

export interface ActionIconProps {
	action?: ActionData
}

export function ActionIcon({action}: ActionIconProps) {
	// We explicitly set the size of the image so it can retain dimensions while the image loads
	return (
		<img
			src={action?.icon ?? ACTION_ICON_FALLBACK}
			alt={action?.name}
			className={styles.icon}
		/>
	)
}
