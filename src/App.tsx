import {
	DndContext,
	DragOverEvent,
	DragOverlay,
	DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useDraggable,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {useMemo, useState} from 'react'
import {JobSelect} from './JobSelect'
import {getJobActions, Job} from './xivapi'

enum Bucket {
	ROTATION = 'ROTATION',
	PALETTE = 'PALETTE',
	BIN = 'BIN',
}

type ActionItem = {type: 'action'; action: number}
type Item = ActionItem
type DraggableItem = Item & {key: string}

// TODO: should we store items by keys separate to the keys in the draggable data, or keep them merged? consider.
type Items = Record<Bucket, DraggableItem[]>
const buildInitialItems = (): Items => ({
	[Bucket.ROTATION]: [
		// temp items for testing
		{key: 'me', type: 'action', action: 1},
		{key: 'em', type: 'action', action: 2},
	],
	[Bucket.PALETTE]: [],
	[Bucket.BIN]: [],
})

export function App() {
	// todo do i need job?
	const [job, setJob] = useState<Job>()
	const [items, setItems] = useState<Items>(buildInitialItems)
	const [draggingItem, setDraggingItem] = useState<DraggableItem>()
	// flat map structure of all current items
	// todo this is currently only used in ondragstart, if that's the only place we use it can probably just inline it there as a deep find
	const itemMap = useMemo(
		() =>
			new Map(
				Object.values(items).flatMap(items =>
					items.map(item => [item.key, item]),
				),
			),
		[items],
	)

	function findBucket(key: string): Bucket {
		// todo might add buckets as keys as well, check here

		const bucket = Object.keys(items).find(bucket =>
			items[bucket as Bucket].some(item => item.key === key),
		)

		if (bucket == null) {
			throw new Error(`Could not find bucket for key "${key}"`)
		}

		return bucket as Bucket
	}

	function onSelectJob(job: Job) {
		// Clear the palette and set the currently active job
		setItems(items => ({...items, [Bucket.PALETTE]: []}))
		setJob(job)

		// Load in actions and populate the palette
		getJobActions(job).then(actions =>
			setItems(items => ({
				...items,
				[Bucket.PALETTE]: actions.map(action => ({
					type: 'action',
					action: action.id,
					key: `${action.id}`,
				})),
			})),
		)
	}

	// dnd stuff
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
	)

	function onDragStart({active}: DragStartEvent) {
		setDraggingItem(itemMap.get(active.id))
	}

	function onDragOver({active, over}: DragOverEvent) {
		// Not over anything, don't need to act
		if (over == null) {
			return
		}

		// Find the active and over buckets. if they're the same, we don't
		// need to remount anything, and can noop
		const activeBucket = findBucket(active.id)
		const overBucket = findBucket(over.id)
		if (activeBucket === overBucket) {
			return
		}

		// Need to move the item between containers
		// TODO: Handle bin
		setItems(items => {
			// todo: if pulling from palette, need to recycle &c
			const newActive = items[activeBucket].slice()
			const activeIndex = newActive.findIndex(item => item.key === active.id)
			const [activeItem] = newActive.splice(activeIndex, 1)
			return {
				...items,
				[activeBucket]: newActive,
				[overBucket]: [
					// TODO: splice
					...items[overBucket],
					activeItem,
				],
			}
		})
	}

	function onDragEnd() {
		setDraggingItem(undefined)
	}

	function onDragCancel() {
		// TODO
	}

	return (
		<>
			<h1>rotato</h1>
			<DndContext
				sensors={sensors}
				onDragStart={onDragStart}
				onDragOver={onDragOver}
				onDragEnd={onDragEnd}
				onDragCancel={onDragCancel}
			>
				<Rotation items={items[Bucket.ROTATION]} />
				<hr />
				<JobSelect value={job} onChange={onSelectJob} />
				<hr />
				{job && <Palette items={items[Bucket.PALETTE]} />}
				<DragOverlay>
					{draggingItem != null && <ItemView item={draggingItem} />}
				</DragOverlay>
			</DndContext>
		</>
	)
}

interface RotationProps {
	items: DraggableItem[]
}

function Rotation({items}: RotationProps) {
	// todo will need a droppable area for blank state
	return (
		<>
			rotation
			<SortableContext items={items.map(item => item.key)}>
				{items.map(item => (
					<SortableItem key={item.key} item={item} />
				))}
			</SortableContext>
		</>
	)
}

interface SortableItemProps {
	item: DraggableItem
}

function SortableItem({item}: SortableItemProps) {
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
		display: 'inline-block',
	}

	// todo might be able to avoid the wrapper. consider.
	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<ItemView item={item} />
		</div>
	)
}

interface PaletteProps {
	items: DraggableItem[]
}

function Palette({items}: PaletteProps) {
	return (
		<>
			palette
			{items.length === 0 && <>loading...</>}
			{items.map(item => (
				<DraggableItemView key={item.key} item={item} />
			))}
		</>
	)
}

interface DraggableItemViewProps {
	item: DraggableItem
}

function DraggableItemView({item}: DraggableItemViewProps) {
	const {setNodeRef, attributes, listeners} = useDraggable({
		id: item.key,
	})
	// todo might be able to avoid the wrapper. consider.
	return (
		<div
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			style={{display: 'inline-block'}}
		>
			<ItemView item={item} />
		</div>
	)
}

interface ItemViewProps {
	item: Item
}

function ItemView({item}: ItemViewProps) {
	// todo switch case this
	return (
		<div style={{width: 60, height: 60}}>
			{item.type} {item.action}
		</div>
	)
}
