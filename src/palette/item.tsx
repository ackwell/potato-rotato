import Tooltip from '@reach/tooltip'
import {TooltipDetail} from '@xivanalysis/tooltips'
import {forwardRef, ReactNode} from 'react'
import {useActionData} from '../data'
import {ActionItem, Item, ItemType} from '../state'
import {ActionIcon} from '../ui'
import styles from './item.module.css'

import '@reach/tooltip/styles.css'

export interface PaletteItemViewProps {
	item: Item
}

export function PaletteItemView({item}: PaletteItemViewProps) {
	switch (item.type) {
		case ItemType.ACTION:
			return <ActionItemView item={item} />
		default:
			return <div>UNK:{ItemType[item.type]}</div>
	}
}

export function ActionItemView({item}: {item: ActionItem}) {
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
