import {useDraggable} from '@dnd-kit/core'
import {
	Accordion,
	AccordionButton,
	AccordionItem,
	AccordionPanel,
} from '@reach/accordion'
import cx from 'classnames'
import {useAtom} from 'jotai'
import {useEffect, useState} from 'react'
import {
	ActionItem,
	Draggable,
	getDraggableItem,
	ItemType,
	paletteAtom,
} from '../state'
import {Container, ContainerHeader, Heading} from '../ui'
import {
	ActionCategory,
	fetchBozjaCategories,
	fetchPvpCategories,
	fetchRegularCategories,
	fetchRoleCategories,
} from './category'
import {PaletteItemView} from './item'
import {Job, JobSelect} from './jobSelect'
import styles from './palette.module.css'

import '@reach/accordion/styles.css'

export function Palette() {
	const [job, setJob] = useState<Job>()
	const [categories, setCategories] = useState<ActionCategory[]>([])
	const [palette, setPalette] = useAtom(paletteAtom)

	const [open, setOpen] = useState<number[]>([])
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

		setCategories([])
		setPalette([])

		// TODO: Opt-in for all but regular, and make their requests lazy.
		// TODO: Categories
		// - Items / general actions
		Promise.all([
			fetchRegularCategories(job),
			fetchRoleCategories(job),
			fetchPvpCategories(job),
			fetchBozjaCategories(job),
		]).then(categoryGroups => {
			const categories = categoryGroups.flat()
			setCategories(categories)
			setPalette(
				categories.flatMap(category =>
					category.actions.map(action =>
						getDraggableItem({type: ItemType.ACTION, action: action.id}),
					),
				),
			)
		})
	}, [job, setPalette])

	return (
		<>
			<ContainerHeader>
				<Heading>Palette</Heading>
				<JobSelect value={job} onChange={setJob} />
			</ContainerHeader>
			<Container>
				<Accordion index={open} onChange={toggleOpenIndex}>
					{categories.map((category, index) => (
						<AccordionItem key={index} className={styles.item}>
							<Heading level={3}>
								<AccordionButton
									className={cx(
										styles.button,
										open.includes(index) && styles.expanded,
									)}
								>
									{category.name}
								</AccordionButton>
							</Heading>
							<AccordionPanel className={styles.panel}>
								{category.actions.map(action => {
									// TODO: I guess I could memo an id map for this
									const item = palette.find(
										(item): item is Draggable<ActionItem> =>
											item.type === ItemType.ACTION &&
											item.action === action.id,
									)
									return (
										item && <DraggableItemView key={item.key} item={item} />
									)
								})}
							</AccordionPanel>
						</AccordionItem>
					))}
				</Accordion>
			</Container>
		</>
	)
}

interface DraggableItemViewProps {
	item: Draggable<ActionItem>
}

function DraggableItemView({item}: DraggableItemViewProps) {
	const {setNodeRef, attributes, listeners} = useDraggable({
		id: item.key,
	})

	// todo might be able to avoid the wrapper. consider.
	// todo merge all item views back together again i guess
	return (
		<div
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			style={{display: 'inline-block'}}
		>
			<PaletteItemView item={item} />
		</div>
	)
}
