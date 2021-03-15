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
import {Header} from './header'
import {Palette} from './palette'
import {Rotation, RotationItemView} from './rotation'
import {ROTATION_ID} from './rotation'
import {idMap, rotationAtom, serialisedRotationAtom} from './state'
import {Stack} from './ui'
import {AtomUrlPersister} from './utils'

// TODO: "View" mode

export function App() {
	const [rotation, setRotation] = useAtom(rotationAtom)
	const [draggingId, setDraggingId] = useState<string>()
	const [rotationBackup, setRotationBackup] = useState<string[]>()

	function inRotation(id: string): boolean {
		// Can drop straight on the bucket itself
		if (id === ROTATION_ID) {
			return true
		}
		return rotation.includes(id)
	}

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
	)

	function onDragStart({active}: DragStartEvent) {
		// Set the active item for use in the drag overlay
		setDraggingId(active.id)
		// Back up the current state of the items in case the drag is cancelled and we moved an item between containers
		setRotationBackup(rotation)
	}

	function onDragOver({active, over}: DragOverEvent) {
		// Not over anything, don't need to act
		if (over == null) {
			return
		}

		// TODO: Consider bin here - maybe bin if over == null?
		// If we're moving something into the rotation, merge it in at the intersection point
		if (!inRotation(active.id) && inRotation(over.id)) {
			// TODO: actually rect merge it for that smooth anim
			setRotation(keys => [...keys, active.id])
		}
	}

	function onDragEnd({active, over}: DragEndEvent) {
		cleanUpDrag()

		// Not over anything, don't need to act
		if (over == null) {
			// TODO: over === null for palette is a bin-case, and should remove from idMap
			return
		}

		// TODO: handle bin
		if (!inRotation(over.id)) {
			return
		}

		// If we're over rotation, but not in it already, dragover failed
		if (!inRotation(active.id)) {
			throw new Error(`Invariant: Rotation desync, ${active.id} missing."`)
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

	const draggingItem = draggingId != null ? idMap.get(draggingId) : undefined

	return (
		<>
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
						<RotationItemView overlay item={draggingItem} />
					)}
				</DragOverlay>
			</DndContext>

			<AtomUrlPersister atom={serialisedRotationAtom} />
		</>
	)
}
