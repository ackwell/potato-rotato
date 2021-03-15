import {useDroppable} from '@dnd-kit/core'
import {SortableContext, useSortable} from '@dnd-kit/sortable'
import {useAtom} from 'jotai'
import {itemFamily, rotationAtom} from '../state'
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
						{ids.map(id => (
							<SortableItemView key={id} id={id} />
						))}
					</SortableContext>
				</div>
			</Container>
		</>
	)
}

interface SortableItemViewProps {
	id: string
}

function SortableItemView({id}: SortableItemViewProps) {
	const [item] = useAtom(itemFamily(id))
	const sortable = useSortable({id})

	if (item == null) {
		throw new Error(
			`Invariant: Could not obtain item data for rotation item with ID ${id}`,
		)
	}

	return <RotationItemView item={item} sortable={sortable} />
}
