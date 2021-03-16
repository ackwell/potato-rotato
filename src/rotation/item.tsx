import cx from 'classnames'
import {createContext, ReactNode, useContext} from 'react'
import {useActionData} from '../data'
import {ActionItem, Item, ItemType, PullItem} from '../state'
import {ActionIcon} from '../ui'
import styles from './item.module.css'

interface ItemViewProps<I extends Item> {
	item: I
	overlay?: boolean
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

function ActionItemView({item, overlay}: ItemViewProps<ActionItem>) {
	const action = useActionData(item.action)
	return (
		<SortableWrapper
			// TODO: We need the gcd padding when dragging from rotation, but not when dragging from palette.
			className={cx(styles.item, action?.onGcd && !overlay && styles.onGcd)}
		>
			<ActionIcon action={action} />
		</SortableWrapper>
	)
}

function PullItemView({overlay}: ItemViewProps<PullItem>) {
	// The pull marker has a more-involved inline UI, we don't need a drag overlay for this one
	if (overlay) {
		return null
	}

	return (
		<SortableWrapper className={cx(styles.item, styles.pull)}>
			<span className={styles.pullText}>Pull</span>
		</SortableWrapper>
	)
}

interface SortableWrapperProps {
	children?: ReactNode
	className?: string
}

export type WrapperProps = JSX.IntrinsicElements['div']
export const WrapperContext = createContext<WrapperProps>({})

function SortableWrapper({children, className}: SortableWrapperProps) {
	const wrapperProps = useContext(WrapperContext)

	return (
		<div {...wrapperProps} className={cx(className, wrapperProps.className)}>
			{children}
		</div>
	)
}
