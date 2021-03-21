import cx from 'clsx'
import {useAtom} from 'jotai'
import {ComponentType, forwardRef} from 'react'
import styles from './rotation.module.css'
import {Item, itemFamily, Mode, modeAtom, rotationAtom} from './state'
import {Heading, Container, ContainerHeader} from './ui'

export interface RotationItemProps {
	id: string
	item: Item
}

export interface RotationProps {
	Item: ComponentType<RotationItemProps>
	layout: 'grid' | 'flex'
}

export const Rotation = forwardRef<HTMLDivElement, RotationProps>(
	function Rotation({Item, layout}, ref) {
		const [ids] = useAtom(rotationAtom)
		const [mode, setMode] = useAtom(modeAtom)

		return (
			<>
				<ContainerHeader>
					<Heading>Rotation</Heading>
					{/* This isn't the _best_ UX, let's be real. Find a better spot? */}
					<div>
						<button
							disabled={mode === Mode.EDIT}
							onClick={() => setMode(Mode.EDIT)}
						>
							Edit
						</button>
						<button
							disabled={mode === Mode.VIEW}
							onClick={() => setMode(Mode.VIEW)}
						>
							View
						</button>
					</div>
				</ContainerHeader>
				<Container>
					<div ref={ref} className={cx(styles.rotation, styles[layout])}>
						{ids.map(id => (
							// Hm. Ideally, Item would have extra style applied to it, rather than
							// a cruddy wrapper. TODO: Think about how to achieve that cleanly.
							// Maybe i should just take this back to two seperate rotation components...
							<div key={id} className={styles.item}>
								<ResolveItemId key={id} id={id} Item={Item} />
							</div>
						))}
					</div>
				</Container>
			</>
		)
	},
)

interface ResolveItemIdProps {
	id: string
	Item: ComponentType<RotationItemProps>
}

function ResolveItemId({id, Item}: ResolveItemIdProps) {
	const [item] = useAtom(itemFamily(id))

	if (item == null) {
		throw new Error(
			`Invariant: Could not obtain item data for rotation item with ID ${id}`,
		)
	}

	return <Item id={id} item={item} />
}
