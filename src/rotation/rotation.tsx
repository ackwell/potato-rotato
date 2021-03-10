import {useDroppable} from '@dnd-kit/core'
import {SortableContext, useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {Bucket, Draggable, Item} from '../state'
import {Heading, Container, ContainerHeader} from '../ui'
import {RotationItemView} from './item'
import styles from './rotation.module.css'

export interface RotationProps {
	items: Draggable<Item>[]
}

export function Rotation({items}: RotationProps) {
	const {setNodeRef} = useDroppable({id: Bucket.ROTATION})

	return (
		<>
			<ContainerHeader>
				<Heading>Rotation</Heading>
			</ContainerHeader>
			<Container>
				<div ref={setNodeRef} className={styles.rotation}>
					<SortableContext items={items.map(item => item.key)}>
						{items.map(item => (
							<SortableItemView key={item.key} item={item} />
						))}
					</SortableContext>
				</div>
			</Container>
		</>
	)
}

interface SortableItemViewProps {
	item: Draggable<Item>
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
		transform: CSS.Translate.toString(transform),
		transition,
	}

	// todo might be able to avoid the wrapper. consider.
	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<RotationItemView item={item} />
		</div>
	)
}
