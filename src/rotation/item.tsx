import cx from 'classnames'
import {useActionData} from '../data'
import {ActionItem, Item, ItemType} from '../state'
import {ActionIcon} from '../ui'
import styles from './item.module.css'

export interface RotationItemViewProps {
	item: Item
	overlay?: boolean
}

export function RotationItemView({item}: RotationItemViewProps) {
	switch (item.type) {
		case ItemType.ACTION:
			return <ActionItemView item={item} />
	}
	return <>UNK:{ItemType[item.type]}</>
}

function ActionItemView({item}: {item: ActionItem}) {
	const action = useActionData(item.action)
	return (
		<div className={cx(styles.item, action?.onGcd && styles.onGcd)}>
			<ActionIcon action={action} />
		</div>
	)
}
