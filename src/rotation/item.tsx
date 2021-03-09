import cx from 'classnames'
import {useActionData} from '../data'
import {Item} from '../state'
import {ActionIcon} from '../ui'
import styles from './item.module.css'

export interface RotationItemViewProps {
	item: Item
	overlay?: boolean
}

export function RotationItemView({item}: RotationItemViewProps) {
	// TODO: switch case this
	const action = useActionData(item.action)
	return (
		<div className={cx(styles.item, action?.onGcd && styles.onGcd)}>
			<ActionIcon action={action} />
		</div>
	)
}
