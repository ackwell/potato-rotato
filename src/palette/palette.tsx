import {useDraggable} from '@dnd-kit/core'
import {useAtom} from 'jotai'
import {Fragment, useEffect, useState} from 'react'
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
} from './category'
import {PaletteItemView} from './item'
import {Job, JobSelect} from './jobSelect'

export function Palette() {
	const [job, setJob] = useState<Job>()
	const [categories, setCategories] = useState<ActionCategory[]>([])
	const [palette, setPalette] = useAtom(paletteAtom)

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
			</ContainerHeader>
			<Container>
				<JobSelect value={job} onChange={setJob} />

				<dl>
					{categories.map((category, index) => (
						<Fragment key={index}>
							<dt>{category.name}</dt>
							<dd>
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
							</dd>
						</Fragment>
					))}
				</dl>
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
