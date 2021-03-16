import Tooltip from '@reach/tooltip'
import {TooltipDetail} from '@xivanalysis/tooltips'
import {forwardRef, ReactNode} from 'react'
import {useActionData} from '../data'
import {ActionItem, Item, ItemType, PullItem} from '../state'
import {ActionIcon} from '../ui'
import styles from './item.module.css'

import '@reach/tooltip/styles.css'

interface ItemViewProps<I extends Item> {
	item: I
}

export type PaletteItemViewProps = ItemViewProps<Item>

export function PaletteItemView({item}: PaletteItemViewProps) {
	switch (item.type) {
		case ItemType.ACTION:
			return <ActionItemView item={item} />
		case ItemType.PULL:
			return <PullItemView item={item} />
		default:
			return <div>UNK:{ItemType[(item as any).type]}</div>
	}
}

function ActionItemView({item}: ItemViewProps<ActionItem>) {
	const action = useActionData(item.action)
	return (
		<Tooltip
			label={<TooltipDetail sheet="Action" id={item.action} />}
			className={styles.tooltipWrapper}
		>
			<div>
				<PaletteInfo
					icon={<ActionIcon action={action} />}
					name={action?.name ?? 'Loading'}
				/>
			</div>
		</Tooltip>
	)
}

function PullItemView({item}: ItemViewProps<PullItem>) {
	return (
		<PaletteInfo
			icon={<div className={styles.pullIcon}>Pull</div>}
			name="Pull marker"
		/>
	)
}

interface PaletteInfoProps {
	icon: ReactNode
	name: string
}

const PaletteInfo = forwardRef<HTMLDivElement, PaletteInfoProps>(
	function PaletteInfo({icon, name}, ref) {
		return (
			<div ref={ref} className={styles.info}>
				{icon}
				<span className={styles.name}>{name}</span>
			</div>
		)
	},
)
