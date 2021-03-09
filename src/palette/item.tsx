import {useActionData} from '../data'
import {Item} from '../state'
import {ActionIcon} from '../ui'

export interface PaletteItemViewProps {
	item: Item
}

export function PaletteItemView({item}: PaletteItemViewProps) {
	const action = useActionData(item.action)
	return <ActionIcon action={action} />
}
