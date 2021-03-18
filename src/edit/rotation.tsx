import {useDroppable} from '@dnd-kit/core'
import {SortableContext, useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import cx from 'classnames'
import {useAtom} from 'jotai'
import {ItemView, WrapperContext, WrapperProps} from '../item'
import {View} from '../item'
import {Rotation, RotationItemProps} from '../rotation'
import {rotationAtom} from '../state'
import styles from './rotation.module.css'

export const ROTATION_ID = 'ROTATION'

export function EditRotation() {
	const {setNodeRef} = useDroppable({id: ROTATION_ID})
	const [ids] = useAtom(rotationAtom)

	return (
		<SortableContext items={ids}>
			<Rotation ref={setNodeRef} Item={EditItem} />
		</SortableContext>
	)
}

function EditItem({id, item}: RotationItemProps) {
	const sortable = useSortable({id})

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
			<ItemView item={item} view={View.ROTATION} />
		</WrapperContext.Provider>
	)
}
