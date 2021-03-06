import {column, Data, useGameData} from '@xivanalysis/tooltips'

export type ActionItem = {type: 'action'; action: number}
export type Item = ActionItem
export type DraggableItem = Item & {key: string}

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
		<div style={{width: 60, height: 60}}>
			{action && <img src={action.icon} alt={action.name} />}
		</div>
	)
}
