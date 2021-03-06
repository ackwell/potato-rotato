import {useDraggable} from '@dnd-kit/core'
import {DraggableItem, ItemView} from './Item'

export interface PaletteProps {
	items: DraggableItem[]
}

export function Palette({items}: PaletteProps) {
	return (
		<>
			palette
			{items.length === 0 && <>loading...</>}
			{items.map(item => (
				<DraggableItemView key={item.key} item={item} />
			))}
		</>
	)
}

interface DraggableItemViewProps {
	item: DraggableItem
}

function DraggableItemView({item}: DraggableItemViewProps) {
	const {setNodeRef, attributes, listeners} = useDraggable({
		id: item.key,
	})

	// todo might be able to avoid the wrapper. consider.
	return (
		<div
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			style={{display: 'inline-block'}}
		>
			<ItemView item={item} />
		</div>
	)
}
