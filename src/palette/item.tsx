import {useActionData} from '../data'
import {ActionItem} from '../state'
import {ActionIcon} from '../ui'

export interface PaletteItemViewProps {
	item: ActionItem
}

export function PaletteItemView({item}: PaletteItemViewProps) {
	const action = useActionData(item.action)
	return <ActionIcon action={action} />
}
