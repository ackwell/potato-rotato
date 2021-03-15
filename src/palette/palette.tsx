import {useDraggable} from '@dnd-kit/core'
import {
	Accordion,
	AccordionButton,
	AccordionItem,
	AccordionPanel,
} from '@reach/accordion'
import cx from 'classnames'
import {useUpdateAtom} from 'jotai/utils'
import {useEffect, useMemo, useState} from 'react'
import {ActionItem, getDraggableId, Item, itemFamily, ItemType} from '../state'
import {Container, ContainerHeader, Heading} from '../ui'
import {
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

export function Palette() {
	const [job, setJob] = useState<Job>()

	const categories = useMemo(() => {
		return job == null
			? []
			: [
					getRegularCategory(job),
					getRoleCategory(job),
					getPvpCategory(job),
					getBozjaCategory(job),
			  ]
	}, [job])

	const [open, setOpen] = useState<number[]>([0, 1])
	const toggleOpenIndex = (index: number) =>
		setOpen(open =>
			open.includes(index)
				? [...open.filter(thing => index !== thing)]
				: [...open, index],
		)

	return (
		<>
			<ContainerHeader>
				<Heading>Palette</Heading>
				<JobSelect value={job} onChange={setJob} />
			</ContainerHeader>
			<Container>
				<Accordion index={open} onChange={toggleOpenIndex}>
					{categories.map((category, index) => {
						const isOpen = open.includes(index)
						return (
							<AccordionItem className={styles.item}>
								<Heading level={3}>
									<AccordionButton
										className={cx(styles.button, isOpen && styles.expanded)}
									>
										{category.name}
									</AccordionButton>
								</Heading>
								<AccordionPanel className={styles.panel}>
									{isOpen && <GroupContent category={category} />}
								</AccordionPanel>
							</AccordionItem>
						)
					})}
				</Accordion>
			</Container>
		</>
	)
}

interface GroupContentProps {
	category: ActionCategory
}

function GroupContent({category}: GroupContentProps) {
	const [items, setItems] = useState<Item[]>()

	useEffect(() => {
		let stale = false

		category.fetchActions().then(fetchedActions => {
			if (stale) {
				return
			}
			setItems(
				fetchedActions.map(action => ({
					type: ItemType.ACTION,
					action: action.id,
				})),
			)
		})

		return () => {
			stale = true
		}
	}, [category])

	return (
		<>
			{items == null && 'Loading'}
			{items?.map(item => (
				<DraggableItemView item={item} />
			))}
		</>
	)
}

interface DraggableItemViewProps {
	item: Item
}

function DraggableItemView({item}: DraggableItemViewProps) {
	const [id, setId] = useState(() => getDraggableId())
	const {setNodeRef, attributes, listeners, isDragging} = useDraggable({id})
	const updateItemFamily = useUpdateAtom(itemFamily(id))

	// Ensure the idMap always has an up-to-date reference to the item for this id
	useEffect(() => {
		updateItemFamily(item)
	}, [updateItemFamily, item])

	// Whenever we start dragging, we need to generate a new id in the place of the dragged item
	useEffect(() => {
		if (!isDragging) {
			return
		}
		setId(getDraggableId())
	}, [isDragging])

	// todo might be able to avoid the wrapper. consider.
	// todo merge all item views back together again i guess?
	return (
		<div ref={setNodeRef} {...attributes} {...listeners}>
			<PaletteItemView item={item as ActionItem} />
		</div>
	)
}
