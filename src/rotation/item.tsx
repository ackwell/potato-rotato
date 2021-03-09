import {useActionData} from '../data'
import {Item} from '../state'
import {ActionIcon} from '../ui'

export interface ItemViewProps {
	item: Item
}

export function ItemView({item}: ItemViewProps) {
	// TODO: switch case this
	const action = useActionData(item.action)
	return <ActionIcon action={action} />
}
