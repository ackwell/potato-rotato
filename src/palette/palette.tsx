import {useDraggable} from '@dnd-kit/core'
import {
	Accordion,
	AccordionButton,
	AccordionItem,
	AccordionPanel,
} from '@reach/accordion'
import cx from 'clsx'
import {useUpdateAtom} from 'jotai/utils'
import {ReactNode, useEffect, useMemo, useRef, useState} from 'react'
import {ItemView, View, WrapperContext, WrapperProps} from '../item'
import {getDraggableId, Item, itemFamily} from '../state'
import {Container, ContainerHeader, Heading} from '../ui'
import {
	Category,
	getBozjaCategory,
	getPvpCategory,
	getRegularCategory,
	getRoleCategory,
	utilityCategory,
} from './category'
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
					utilityCategory,
					getPvpCategory(job),
					getBozjaCategory(job),
			  ]
	}, [job])

	const [open, setOpen] = useState<number[]>([0, 1, 2])
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
							<AccordionGroup
								// Keying on job ID to ensure lazy handling is reset by the remount when swapping between jobs.
								key={`${job?.id}-${index}`}
								name={category.name}
								open={isOpen}
							>
								<GroupContent category={category} />
							</AccordionGroup>
						)
					})}
				</Accordion>
			</Container>
		</>
	)
}

interface AccordionGroupProps {
	name: string
	children?: ReactNode
	open: boolean
}

function AccordionGroup({name, children, open}: AccordionGroupProps) {
	// Track if this group has ever been open to avoid constantly remounting children when reopening
	const lazyOpen = useRef(open)
	lazyOpen.current = lazyOpen.current || open

	return (
		<AccordionItem className={styles.item}>
			<Heading level={3}>
				<AccordionButton className={cx(styles.button, open && styles.expanded)}>
					{name}
				</AccordionButton>
			</Heading>
			<AccordionPanel className={styles.panel}>
				{lazyOpen.current && children}
			</AccordionPanel>
		</AccordionItem>
	)
}

interface GroupContentProps {
	category: Category
}

function GroupContent({category}: GroupContentProps) {
	const [items, setItems] = useState<Item[]>([])

	useEffect(() => {
		let stale = false

		category.fetchItems().then(fetchedActions => {
			if (stale) {
				return
			}
			setItems(fetchedActions)
		})

		return () => {
			stale = true
			setItems([])
		}
	}, [category])

	return (
		<>
			{items.length === 0 && 'Loading'}
			{items.map((item, index) => (
				<DraggableItemView key={index} item={item} />
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

	// Keep a non-tripping ref to the current ID. When we unmount, clear out the current ID from the family
	const idRef = useRef<string>('')
	idRef.current = id
	useEffect(() => () => itemFamily.remove(idRef.current), [])

	// Props to pass down into the draggable element
	const wrapperProps: WrapperProps = {
		ref: setNodeRef,
		className: styles.draggable,
		...attributes,
		...listeners,
	}

	// todo might be able to avoid the wrapper. consider.
	// todo merge all item views back together again i guess?
	return (
		<WrapperContext.Provider value={wrapperProps}>
			<ItemView item={item} view={View.PALETTE} />
		</WrapperContext.Provider>
	)
}
