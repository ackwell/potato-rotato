import {useDraggable} from '@dnd-kit/core'
import {
	Accordion,
	AccordionButton,
	AccordionItem,
	AccordionPanel,
} from '@reach/accordion'
import cx from 'classnames'
import {atom, useAtom} from 'jotai'
import {SetStateAction} from 'jotai/core/types'
import {useEffect, useLayoutEffect, useRef, useState} from 'react'
import {
	ActionItem,
	Bucket,
	Draggable,
	getDraggableItem,
	getDraggableKey,
	idMap,
	Item,
	ItemType,
	rotationAtom,
} from '../state'
// import {itemsAtom} from '../state'
import {Container, ContainerHeader, Heading} from '../ui'
import {
	Action,
	ActionCategory,
	getBozjaCategory,
	getPvpCategory,
	getRegularCategory,
	getRoleCategory,
} from './category'
import {PaletteItemView} from './item'
import {Job, JobSelect} from './jobSelect'
import styles from './palette.module.css'

import '@reach/accordion/styles.css'

// const paletteAtom = atom(
// 	get => get(itemsAtom)[Bucket.PALETTE],
// 	(get, set, update: SetStateAction<Draggable<Item>[]>) => {
// 		set(itemsAtom, items => ({
// 			...items,
// 			[Bucket.PALETTE]:
// 				typeof update === 'function' ? update(items[Bucket.PALETTE]) : update,
// 		}))
// 	},
// )

export function Palette() {
	const [job, setJob] = useState<Job>()
	const [categories, setCategories] = useState<ActionCategory[]>([])

	const [open, setOpen] = useState<number[]>([0, 1])
	const toggleOpenIndex = (index: number) =>
		setOpen(open =>
			open.includes(index)
				? [...open.filter(thing => index !== thing)]
				: [...open, index],
		)

	// When job is updated, fetch & categorise actions for the new selection
	useEffect(() => {
		if (job == null) {
			return
		}

		setCategories([
			getRegularCategory(job),
			getRoleCategory(job),
			getPvpCategory(job),
			getBozjaCategory(job),
		])
	}, [job])

	return (
		<>
			<ContainerHeader>
				<Heading>Palette</Heading>
				<JobSelect value={job} onChange={setJob} />
			</ContainerHeader>
			<Container>
				<Accordion index={open} onChange={toggleOpenIndex}>
					{categories.map((category, index) => (
						<PaletteGroup
							key={index}
							category={category}
							open={open.includes(index)}
						/>
					))}
				</Accordion>
			</Container>
		</>
	)
}

interface PaletteGroupProps {
	category: ActionCategory
	open: boolean
}

function PaletteGroup({category, open}: PaletteGroupProps) {
	// // Using ref for local actions, relying on palette to trigger rerender
	// const [palette, setPalette] = useAtom(paletteAtom)
	// const actions = useRef<Action[]>()

	// useEffect(() => {
	// 	// If the group is closed, or already has data, noop
	// 	if (!open || actions.current != null) {
	// 		return
	// 	}

	// 	// Track if this effect has already been cleaned up so we don't leak
	// 	let cleaned = false

	// 	category.fetchActions().then(fetchedActions => {
	// 		if (cleaned) {
	// 			return
	// 		}

	// 		// Set the current actions, merge into the end of the palette
	// 		actions.current = fetchedActions
	// 		setPalette(palette => [
	// 			...palette,
	// 			...fetchedActions.map(action =>
	// 				getDraggableItem({type: ItemType.ACTION, action: action.id}),
	// 			),
	// 		])
	// 	})

	// 	return () => {
	// 		// Mark as cleaned, filter out actions from the pallete and clean ref
	// 		cleaned = true
	// 		setPalette(palette => [
	// 			...palette.filter(
	// 				item =>
	// 					item.type !== ItemType.ACTION ||
	// 					!(actions.current ?? []).some(action => action.id === item.action),
	// 			),
	// 		])
	// 		actions.current = undefined
	// 	}
	// }, [open, actions, category, setPalette])

	return (
		<AccordionItem className={styles.item}>
			<Heading level={3}>
				<AccordionButton className={cx(styles.button, open && styles.expanded)}>
					{category.name}
				</AccordionButton>
			</Heading>
			<AccordionPanel className={styles.panel}>
				{/* {actions.current == null && 'Loading'}
				{actions.current?.map(action => {
					// const item = palette.find(
					// 	(item): item is Draggable<ActionItem> =>
					// 		item.type === ItemType.ACTION && item.action === action.id,
					// )
					// return item && <DraggableItemView key={item.key} item={item} />
					return null
				})} */}
				{open && <GroupContent category={category} />}
			</AccordionPanel>
		</AccordionItem>
	)
}

interface GroupContentProps {
	category: ActionCategory
}

function GroupContent({category}: GroupContentProps) {
	const [actions, setActions] = useState<Action[]>()

	useEffect(() => {
		let stale = false

		category.fetchActions().then(fetchedActions => {
			if (stale) {
				return
			}
			setActions(fetchedActions)
		})

		return () => {
			stale = true
		}
	}, [category])

	return (
		<>
			{actions == null && 'Loading'}
			{actions?.map(action => (
				<DraggableItemView item={{type: ItemType.ACTION, action: action.id}} />
			))}
		</>
	)
}

// TODO rename
interface DraggableItemViewProps {
	// item: Draggable<ActionItem>

	item: Item
}

// function DraggableItemView({item}: DraggableItemViewProps) {
function DraggableItemView({item}: DraggableItemViewProps) {
	const [key, setKey] = useState(() => getDraggableKey())
	const {setNodeRef, attributes, listeners, isDragging} = useDraggable({
		id: key,
	})

	// effect or something? kill me
	idMap.set(key, item)

	// if the fuckign rotation has the fucking key in it then reallocate or some bullshit idk just fuking work thanks
	// THIS FAILS, AS IT CAUSES DRAGGABLE TO CHANGE ID _AFTER_ THE ROTATION IS UPDATES, WHICH NUKES THE DRAGGABLE ID->NODE CONNECTION
	// const [rotation] = useAtom(rotationAtom)
	// useEffect(() => {
	// 	if (!rotation.includes(key)) {
	// 		return
	// 	}
	// 	console.log('REGEN')
	// 	setKey(getDraggableKey())
	// }, [key, rotation])
	useEffect(() => {
		if (!isDragging) {
			return
		}
		setKey(getDraggableKey())
	}, [isDragging])

	// todo might be able to avoid the wrapper. consider.
	// todo merge all item views back together again i guess?
	return (
		<div ref={setNodeRef} {...attributes} {...listeners}>
			<PaletteItemView item={item as ActionItem} />
		</div>
	)
}
