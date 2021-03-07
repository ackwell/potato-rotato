import {
	DndContext,
	DragEndEvent,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useDroppable,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {arrayMove, sortableKeyboardCoordinates} from '@dnd-kit/sortable'
import {useAtom} from 'jotai'
import {useState} from 'react'
import {ItemView} from './item'
import {Palette} from './palette'
import {Rotation} from './rotation'
import {
	Bucket,
	DraggableItem,
	getDraggableItem,
	Items,
	itemsAtom,
	serialisedRotationAtom,
} from './state'
import {AtomUrlPersister} from './utils'

export function App() {
	const [items, setItems] = useAtom(itemsAtom)
	const [itemsBackup, setItemsBackup] = useState<Items>()
	const [draggingItem, setDraggingItem] = useState<DraggableItem>()

	function findBucket(key: string): Bucket {
		// Key might be a bucket unto itself, check first
		if (key in items) {
			return key as Bucket
		}

		const bucket = Object.keys(items).find(bucket =>
			items[bucket as Bucket].some(item => item.key === key),
		)

		if (bucket == null) {
			throw new Error(`Could not find bucket for key "${key}"`)
		}

		return bucket as Bucket
	}

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
	)

	function onDragStart({active}: DragStartEvent) {
		// Set the active item for use in the drag overlay
		let draggingItem: DraggableItem | undefined
		for (const bucketItems of Object.values(items)) {
			draggingItem = bucketItems.find(item => item.key === active.id)
			if (draggingItem != null) {
				break
			}
		}
		setDraggingItem(draggingItem)

		// Back up the current state of the items in case the drag is cancelled and we moved an item between containers
		setItemsBackup(items)
	}

	function onDragOver({active, over}: DragOverEvent) {
		// Not over anything, don't need to act
		if (over == null) {
			return
		}

		// Find the active and over buckets. if they're the same, we don't need to remount anything, and can noop
		const activeBucket = findBucket(active.id)
		const overBucket = findBucket(over.id)
		if (activeBucket === overBucket) {
			return
		}

		// Need to move the item between containers
		setItems(items => {
			// todo: if pulling from palette, need to replace active with copy w new id
			const activeItems = items[activeBucket]
			const activeIndex = activeItems.findIndex(item => item.key === active.id)

			// If pulling from the palette, we want to replace the one we're removing with a fresh copy
			const replaceItems =
				activeBucket === Bucket.PALETTE
					? [getDraggableItem(activeItems[activeIndex])]
					: []

			return {
				...items,
				[activeBucket]: [
					...activeItems.slice(0, activeIndex),
					...replaceItems,
					...activeItems.slice(activeIndex + 1),
				],
				// inserting active at end of over, we'll reorder the bucket in drag end
				[overBucket]: [...items[overBucket], activeItems[activeIndex]],
			}
		})
	}

	function onDragEnd({active, over}: DragEndEvent) {
		cleanUpDrag()

		// Not over anything, don't need to act
		if (over == null) {
			return
		}

		const activeBucket = findBucket(active.id)
		const overBucket = findBucket(over.id)

		// onDragOver should handle all bucket shuffling for us. Ensure it did.
		if (activeBucket !== overBucket) {
			throw new Error(
				`Invariant: Bucket desync. Drag end recieved move "${activeBucket}"->"${overBucket}"`,
			)
		}

		// Reorder the bucket to finalise the drag
		const activeIndex = items[activeBucket].findIndex(
			item => item.key === active.id,
		)
		const overIndex = items[overBucket].findIndex(item => item.key === over.id)
		if (activeIndex === overIndex) {
			return
		}

		setItems(items => ({
			...items,
			[overBucket]: arrayMove(items[overBucket], activeIndex, overIndex),
			[Bucket.BIN]: [],
		}))
	}

	function onDragCancel() {
		// Restore the item state to our backup if we have any
		if (itemsBackup) {
			setItems(itemsBackup)
		}

		cleanUpDrag()
	}

	function cleanUpDrag() {
		setDraggingItem(undefined)
		setItemsBackup(undefined)
	}

	return (
		<>
			<DndContext
				sensors={sensors}
				onDragStart={onDragStart}
				onDragOver={onDragOver}
				onDragEnd={onDragEnd}
				onDragCancel={onDragCancel}
			>
				<Rotation items={items[Bucket.ROTATION]} />
				<hr />
				<Palette />
				<hr />
				<Bin />
				<DragOverlay>
					{draggingItem != null && <ItemView item={draggingItem} />}
				</DragOverlay>
			</DndContext>

			<AtomUrlPersister atom={serialisedRotationAtom} />
		</>
	)
}

function Bin() {
	const {setNodeRef, isOver} = useDroppable({id: Bucket.BIN})
	return (
		<div ref={setNodeRef} style={{background: isOver ? 'red' : undefined}}>
			bin
		</div>
	)
}