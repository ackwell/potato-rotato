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
	overlay = false,
	sortable,
}: RotationItemViewProps) {
	switch (item.type) {
		case ItemType.ACTION:
			return <ActionItemView item={item} sortable={sortable} />
		case ItemType.PULL:
			return <PullItemView overlay={overlay} sortable={sortable} />
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

function PullItemView({
	overlay,
	sortable,
}: {
	overlay: boolean
	sortable?: SortableOptions
}) {
	return (
		<SortableWrapper
			sortable={sortable}
			className={cx(styles.item, styles.pull, !overlay && styles.showRegion)}
		>
			<div
				style={{zIndex: 0, position: 'relative', transform: 'rotate(90deg)'}}
			>
				Pull
			</div>
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
