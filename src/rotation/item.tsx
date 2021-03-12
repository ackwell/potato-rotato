import {useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import cx from 'classnames'
import {ReactNode} from 'react'
import {useActionData} from '../data'
import {ActionItem, Item, ItemType} from '../state'
import {ActionIcon} from '../ui'
import styles from './item.module.css'

type SortableOptions = ReturnType<typeof useSortable>

export interface RotationItemViewProps {
	item: Item
	overlay?: boolean
	sortable?: SortableOptions
}

export function RotationItemView({
	item,
	sortable,
}: RotationItemViewProps) {
	switch (item.type) {
		case ItemType.ACTION:
			return <ActionItemView item={item} sortable={sortable} />
		default:
			return <>UNK:{ItemType[(item as any).type]}</>
	}
}

function ActionItemView({
	item,
	sortable,
}: {
	item: ActionItem
	sortable?: SortableOptions
}) {
	const action = useActionData(item.action)
	return (
		<SortableWrapper
			sortable={sortable}
			className={cx(styles.item, action?.onGcd && styles.onGcd)}
		>
			<ActionIcon action={action} />
		</SortableWrapper>
	)
}

interface SortableWrapperProps {
	children?: ReactNode
	sortable?: SortableOptions
	className?: string
}

function SortableWrapper({
	children,
	sortable,
	className,
}: SortableWrapperProps) {
	let props: JSX.IntrinsicElements['div'] = {
		className,
	}

	if (sortable != null) {
		props = {
			...props,
			ref: sortable.setNodeRef,
			style: {
				...props.style,
				transform: CSS.Translate.toString(sortable.transform),
				transition: sortable.transition,
			},
			...sortable.attributes,
			...sortable.listeners,
		}
	}

	return <div {...props}>{children}</div>
}
