import Tooltip from '@reach/tooltip'
import {TooltipDetail} from '@xivanalysis/tooltips'
import cx from 'clsx'
import {ReactNode} from 'react'
import {useActionData} from '../data'
import {ActionItem} from '../state'
import {ActionIcon} from '../ui'
import styles from './action.module.css'
import {ItemViewProps, ItemWrapper, PaletteInfo, View} from './base'

import '@reach/tooltip/styles.css'

export function ActionItemView({item, view}: ItemViewProps<ActionItem>) {
	const action = useActionData(item.action)

	const icon = <ActionIcon action={action} />

	if (view === View.PALETTE) {
		return (
			<ActionTooltip id={item.action}>
				<PaletteInfo icon={icon} name={action?.name ?? 'Loading'} />
			</ActionTooltip>
		)
	}

	return (
		<ItemWrapper
			// TODO: We need the gcd padding when dragging from rotation, but not when dragging from palette.
			className={cx(action?.onGcd && styles.onGcd)}
		>
			{icon}
		</ItemWrapper>
	)
}

interface ActionTooltipProps {
	id: number
	children?: ReactNode
}

function ActionTooltip({id, children}: ActionTooltipProps) {
	return (
		<Tooltip
			label={<TooltipDetail sheet="Action" id={id} />}
			className={styles.tooltipWrapper}
		>
			<div>{children}</div>
		</Tooltip>
	)
}
