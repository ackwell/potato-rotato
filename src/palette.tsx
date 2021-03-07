import {useDraggable} from '@dnd-kit/core'
import {useAtom} from 'jotai'
import {useState} from 'react'
import {ItemView} from './item'
import {JobSelect} from './jobSelect'
import {DraggableItem, ItemType, paletteAtom} from './state'
import {Container, Heading} from './ui'
import {getJobActions, Job} from './xivapi'

export function Palette() {
	const [job, setJob] = useState<Job>()
	const [palette, setPalette] = useAtom(paletteAtom)

	function onSelectJob(job: Job) {
		// Clear the palette and set the currently active job
		setPalette([])
		setJob(job)

		// Load in actions and populate the palette
		getJobActions(job).then(actions =>
			setPalette(
				actions.map(action => ({type: ItemType.ACTION, action: action.id})),
			),
		)
	}

	// TODO: Switches
	// - pvp
	// - bozja
	// - eureka

	return (
		<Container>
			<Heading>Palette</Heading>
			<JobSelect value={job} onChange={onSelectJob} />
			<hr />
			{job != null && palette.length === 0 && <>loading...</>}
			{palette.map(item => (
				<DraggableItemView key={item.key} item={item} />
			))}
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
