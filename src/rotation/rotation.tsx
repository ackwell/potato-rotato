import {useDroppable} from '@dnd-kit/core'
import {SortableContext, useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import cx from 'classnames'
import {useAtom} from 'jotai'
import {itemFamily, rotationAtom} from '../state'
import {Heading, Container, ContainerHeader} from '../ui'
import {RotationItemView, WrapperProps, WrapperContext} from './item'
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

	const wrapperProps: WrapperProps = {
		ref: sortable.setNodeRef,
		style: {
			transform: CSS.Translate.toString(sortable.transform),
			transition: sortable.transition,
		},
		className: cx(styles.draggable, sortable.isDragging && styles.dragging),
		...sortable.attributes,
		...sortable.listeners,
	}

	return (
		<WrapperContext.Provider value={wrapperProps}>
			<RotationItemView item={item} />
		</WrapperContext.Provider>
	)
}
