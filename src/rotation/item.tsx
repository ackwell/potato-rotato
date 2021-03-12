import {useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import cx from 'classnames'
import {ReactNode} from 'react'
import {useActionData} from '../data'
import {ActionItem, Item, ItemType, PullItem} from '../state'
import {ActionIcon} from '../ui'
import styles from './item.module.css'

type SortableOptions = ReturnType<typeof useSortable>

interface ItemViewProps<I extends Item> {
	item: I
	overlay?: boolean
	sortable?: SortableOptions
}

export type RotationItemViewProps = ItemViewProps<Item>

export function RotationItemView(props: RotationItemViewProps) {
	switch (props.item.type) {
		case ItemType.ACTION:
			return <ActionItemView {...(props as ItemViewProps<ActionItem>)} />
		case ItemType.PULL:
			return <PullItemView {...(props as ItemViewProps<PullItem>)} />
		default:
			return <>UNK:{ItemType[(props.item as any).type]}</>
	}
}

function ActionItemView({item, sortable}: ItemViewProps<ActionItem>) {
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

function PullItemView({overlay, sortable}: ItemViewProps<PullItem>) {
	// The pull marker has a more-involved inline UI, we don't need a drag overlay for this one
	if (overlay) {
		return null
	}

	return (
		<SortableWrapper
			sortable={sortable}
			className={cx(styles.item, styles.pull)}
		>
			<span className={styles.pullText}>Pull</span>
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
			className: cx(
				props.className,
				styles.draggable,
				sortable.isDragging && styles.dragging,
			),
			...sortable.attributes,
			...sortable.listeners,
		}
	}

	return <div {...props}>{children}</div>
}
