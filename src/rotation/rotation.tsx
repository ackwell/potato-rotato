import {useDroppable} from '@dnd-kit/core'
import {SortableContext, useSortable} from '@dnd-kit/sortable'
import {useAtom} from 'jotai'
import {idMap, Item, rotationAtom} from '../state'
import {Heading, Container, ContainerHeader} from '../ui'
import {RotationItemView} from './item'
import styles from './rotation.module.css'

export const ROTATION_ID = 'ROTATION'

export function Rotation() {
	const {setNodeRef} = useDroppable({id: ROTATION_ID})

	const [ids] = useAtom(rotationAtom)

	return (
		<>
			<ContainerHeader>
				<Heading>Rotation</Heading>
			</ContainerHeader>
			<Container>
				<div ref={setNodeRef} className={styles.rotation}>
					<SortableContext items={ids}>
						{ids.map(id => {
							const item = idMap.get(id)
							return item && <SortableItemView key={id} id={id} item={item} />
						})}
					</SortableContext>
				</div>
			</Container>
		</>
	)
}

interface SortableItemViewProps {
	id: string
	item: Item
}

function SortableItemView({id, item}: SortableItemViewProps) {
	const sortable = useSortable({id})

	return <RotationItemView item={item} sortable={sortable} />
}
