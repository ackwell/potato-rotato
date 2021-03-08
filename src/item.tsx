import {column, Data, useGameData} from '@xivanalysis/tooltips'
import {Item} from './state'

// can probably nuke tooltip lib usage? at least for labels.
class ActionItemData extends Data {
	@column('Name') name!: string
	@column('Icon', {type: 'url'}) icon!: string
}

export interface ItemViewProps {
	item: Item
}

export function ItemView({item}: ItemViewProps) {
	// todo switch case this

	const action = useGameData({
		sheet: 'Action',
		id: item.action,
		columns: ActionItemData,
	})

	return (
		<div style={{width: 40, height: 40}}>
			{action && <img src={action.icon} alt={action.name} />}
		</div>
	)
}
