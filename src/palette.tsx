import {useDraggable} from '@dnd-kit/core'
import {useAtom} from 'jotai'
import {Fragment, useEffect, useState} from 'react'
import {ItemView} from './item'
import {JobSelect} from './jobSelect'
import {DraggableItem, getDraggableItem, ItemType, paletteAtom} from './state'
import {Container, Heading} from './ui'
import {Action, getJobActions, Job} from './xivapi'

interface ActionCategory {
	name: string
	actions: Action[]
}

function categoriseActions(actions: Action[]): ActionCategory[] {
	// TODO: categories
	// - bozja
	// - eureka

	const regular: ActionCategory = {name: 'Actions', actions: []}
	const pvp: ActionCategory = {name: 'PvP', actions: []}

	for (const action of actions) {
		if (action.pvp) {
			pvp.actions.push(action)
			continue
		}

		// TODO: split regular into gcd/ogcd
		regular.actions.push(action)
	}

	regular.actions.sort((a, b) => a.level - b.level)
	pvp.actions.sort((a, b) => (a.pvpOrder ?? 0) - (b.pvpOrder ?? 0))

	return [regular, pvp]
}

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

		getJobActions(job).then(actions => {
			setCategories(categoriseActions(actions))
			setPalette(
				actions.map(action =>
					getDraggableItem({type: ItemType.ACTION, action: action.id}),
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
