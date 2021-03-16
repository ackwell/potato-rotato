import cx from 'classnames'
import {useActionData} from '../data'
import {ActionItem} from '../state'
import {ActionIcon} from '../ui'
import styles from './action.module.css'
import {ItemViewProps, ItemWrapper} from './base'

export function ActionItemView({item}: ItemViewProps<ActionItem>) {
	const action = useActionData(item.action)
	return (
		<ItemWrapper
			// TODO: We need the gcd padding when dragging from rotation, but not when dragging from palette.
			className={cx(action?.onGcd && styles.onGcd)}
		>
			<ActionIcon action={action} />
		</ItemWrapper>
	)
}
