import {
	DndContext,
	DragEndEvent,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {arrayMove, sortableKeyboardCoordinates} from '@dnd-kit/sortable'
import {useAtom} from 'jotai'
import {useState} from 'react'
import {Header} from '../header'
import {ItemView, View} from '../item'
import {Palette} from '../palette'
import {itemFamily, rotationAtom} from '../state'
import {Stack} from '../ui'
import {Rotation, ROTATION_ID} from './rotation'

export function Edit() {
	const [rotation, setRotation] = useAtom(rotationAtom)
	const [draggingId, setDraggingId] = useState<string>()
	const [rotationBackup, setRotationBackup] = useState<string[]>()

	const [draggingItem] = useAtom(itemFamily(draggingId ?? 'NOTHING'))

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
	)

	function inRotation(id: string): boolean {
		// Can drop straight on the bucket itself
		if (id === ROTATION_ID) {
			return true
		}
		return rotation.includes(id)
	}

	function onDragStart({active}: DragStartEvent) {
		// Set the active item for use in the drag overlay
		setDraggingId(active.id)
		// Back up the current state of the items in case the drag is cancelled and we moved an item between containers
		setRotationBackup(rotation)
	}

	function onDragOver({active, over}: DragOverEvent) {
		// Dragging onto nothing - potentially a bin action, wait for end to clean up.
		// NOTE: Removing from rotation here causes burn-a-core-on-a-5800x tier thrash.
		// Likely caused by a temporary null state on newly added sortables.
		// TODO: Look into resolving when it's not 1:21AM.
		if (over == null) {
			return
		}

		// If we're moving something into the rotation, merge it in at the intersection point
		if (!inRotation(active.id) && over != null && inRotation(over.id)) {
			// TODO: actually rect merge it for that smooth anim
			setRotation(ids => [...ids, active.id])
		}
	}

	function onDragEnd({active, over}: DragEndEvent) {
		cleanUpDrag()

		// Finalising a bin action, remove the ID from the family
		if (over == null) {
			itemFamily.remove(active.id)
			setRotation(ids => ids.filter(id => id !== active.id))
			return
		}

		// If we're over rotation, but not in it already, dragover failed
		if (!inRotation(over.id) || !inRotation(active.id)) {
			throw new Error(`Invariant: Rotation desync, ${active.id} missing.`)
		}

		// Reorder the bucket to finalise the drag
		const activeIndex = rotation.indexOf(active.id)
		const overIndex = rotation.indexOf(over.id)
		if (activeIndex === overIndex) {
			return
		}
		setRotation(rotation => arrayMove(rotation, activeIndex, overIndex))
	}

	function onDragCancel() {
		// Restore the item state to our backup if we have any
		if (rotationBackup != null) {
			setRotation(rotationBackup)
		}
		cleanUpDrag()
	}

	function cleanUpDrag() {
		setDraggingId(undefined)
		setRotationBackup(undefined)
	}

	return (
		<DndContext
			sensors={sensors}
			onDragStart={onDragStart}
			onDragOver={onDragOver}
			onDragEnd={onDragEnd}
			onDragCancel={onDragCancel}
		>
			<Stack>
				<Header />
				<Rotation />
				<Palette />
			</Stack>
			<DragOverlay>
				{draggingItem != null && (
					<ItemView item={draggingItem} view={View.OVERLAY} />
				)}
			</DragOverlay>
		</DndContext>
	)
}
