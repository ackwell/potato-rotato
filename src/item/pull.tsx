import cx from 'clsx'
import {PullItem} from '../state'
import {ItemViewProps, ItemWrapper, PaletteInfo, View} from './base'
import styles from './pull.module.css'

export function PullItemView({view}: ItemViewProps<PullItem>) {
	const text = <span className={styles.pullText}>Pull</span>

	if (view === View.PALETTE) {
		return (
			<PaletteInfo
				icon={<div className={styles.pull}>{text}</div>}
				name="Pull marker"
			/>
		)
	}
	return (
		<ItemWrapper
			className={cx(styles.pull, view === View.EDIT && styles.shroud)}
		>
			{text}
		</ItemWrapper>
	)
}
