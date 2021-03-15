import {useDroppable} from '@dnd-kit/core'
import {SortableContext, useSortable} from '@dnd-kit/sortable'
import {useAtom} from 'jotai'
import {Bucket, Draggable, idMap, Item, rotationAtom} from '../state'
import {Heading, Container, ContainerHeader} from '../ui'
import {RotationItemView} from './item'
import styles from './rotation.module.css'

export interface RotationProps {
	// items: Draggable<Item>[]
}

// export function Rotation({items}: RotationProps) {
export function Rotation({}: RotationProps) {
	const {setNodeRef} = useDroppable({id: Bucket.ROTATION})

	const [keys] = useAtom(rotationAtom)
	// console.log(
	// 	keys,
	// 	keys.map(key => idMap.get(key)),
	// )

	return (
		<>
			<ContainerHeader>
				<Heading>Rotation</Heading>
			</ContainerHeader>
			<Container>
				<div ref={setNodeRef} className={styles.rotation}>
					{/* <SortableContext items={items.map(item => item.key)}>
						{items.map(item => (
							<SortableItemView key={item.key} item={item} />
						))}
					</SortableContext> */}
					<SortableContext items={keys}>
						{keys.map(key => {
							const item = idMap.get(key)
							return item && <SortableItemView key={key} id={key} item={item} />
						})}
					</SortableContext>
				</div>
			</Container>
		</>
	)
}

interface SortableItemViewProps {
	// item: Draggable<Item>
	id: string
	item: Item
}

function SortableItemView({id, item}: SortableItemViewProps) {
	const sortable = useSortable({id})

	return <RotationItemView item={item} sortable={sortable} />
}
