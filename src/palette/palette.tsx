import {useDraggable} from '@dnd-kit/core'
import {useAtom} from 'jotai'
import {Fragment, useEffect, useState} from 'react'
import {ItemView} from '../item'
import {JobSelect} from '../jobSelect'
import {DraggableItem, getDraggableItem, ItemType, paletteAtom} from '../state'
import {Container, Heading} from '../ui'
import {Job} from '../xivapi'
import {
	ActionCategory,
	fetchBozjaCategories,
	fetchPvpCategories,
	fetchRegularCategories,
} from './category'

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
		<Container>
			<Heading>Palette</Heading>
			<JobSelect value={job} onChange={setJob} />

			<dl>
				{categories.map((category, index) => (
					<Fragment key={index}>
						<dt>{category.name}</dt>
						<dd>
							{category.actions.map(action => {
								// TODO: I guess I could memo an id map for this
								const item = palette.find(item => item.action === action.id)
								return item && <DraggableItemView key={item.key} item={item} />
							})}
						</dd>
					</Fragment>
				))}
			</dl>
		</Container>
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
