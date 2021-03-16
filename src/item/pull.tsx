import cx from 'classnames'
import {PullItem} from '../state'
import {ItemViewProps, ItemWrapper, View} from './base'
import styles from './pull.module.css'

export function PullItemView({view}: ItemViewProps<PullItem>) {
	return (
		<ItemWrapper
			className={cx(styles.pull, view === View.ROTATION && styles.shroud)}
		>
			<span className={styles.pullText}>Pull</span>
		</ItemWrapper>
	)
}
