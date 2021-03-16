import {Item, ItemType} from '../state'
import {ActionItemView} from './action'
import {ItemViewProps as InternalItemViewProps} from './base'
import {PullItemView} from './pull'

export type ItemViewProps = InternalItemViewProps<Item>

export function ItemView(props: ItemViewProps) {
	switch (props.item.type) {
		case ItemType.ACTION:
			return <ActionItemView {...props} item={props.item} />
		case ItemType.PULL:
			return <PullItemView {...props} item={props.item} />
		default:
			return <div>UNK:{ItemType[(props.item as any).type]}</div>
	}
}
