import {useDroppable} from '@dnd-kit/core'
import {SortableContext, useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {DraggableItem, ItemView} from './item'
import styles from './rotation.module.css'
import {Bucket} from './state'
import {Heading, Container} from './ui'

export interface RotationProps {
	items: DraggableItem[]
}

export function Rotation({items}: RotationProps) {
	const {setNodeRef} = useDroppable({id: Bucket.ROTATION})

	return (
		<Container>
			<Heading>Rotation</Heading>
			<div ref={setNodeRef} className={styles.rotation}>
				<SortableContext items={items.map(item => item.key)}>
					{items.map(item => (
						<SortableItemView key={item.key} item={item} />
					))}
				</SortableContext>
			</div>
		</Container>
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
	}

	// todo might be able to avoid the wrapper. consider.
	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<ItemView item={item} />
		</div>
	)
}
