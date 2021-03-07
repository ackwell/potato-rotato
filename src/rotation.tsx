import {useDroppable} from '@dnd-kit/core'
import {SortableContext, useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {Bucket} from './app'
import {DraggableItem, ItemView} from './item'

export interface RotationProps {
	items: DraggableItem[]
}

export function Rotation({items}: RotationProps) {
	const {setNodeRef} = useDroppable({id: Bucket.ROTATION})

	return (
		<>
			rotation
			<div ref={setNodeRef} style={{minHeight: 60}}>
				<SortableContext items={items.map(item => item.key)}>
					{items.map(item => (
						<SortableItemView key={item.key} item={item} />
					))}
				</SortableContext>
			</div>
		</>
	)
}

interface SortableItemViewProps {
	item: DraggableItem
}

function SortableItemView({item}: SortableItemViewProps) {
	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
	} = useSortable({
		id: item.key,
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		display: 'inline-block',
	}

	// todo might be able to avoid the wrapper. consider.
	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<ItemView item={item} />
		</div>
	)
}
