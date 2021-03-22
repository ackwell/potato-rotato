import {faEye, faPen, IconDefinition} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import cx from 'clsx'
import {useAtom} from 'jotai'
import {ComponentType, forwardRef} from 'react'
import styles from './rotation.module.css'
import {Item, itemFamily, Mode, modeAtom, rotationAtom} from './state'
import {Heading, Container, ContainerHeader} from './ui'

interface ModeData {
	label: string
	icon: IconDefinition
}

const modes: Record<Mode, ModeData> = {
	[Mode.EDIT]: {
		label: 'Edit',
		icon: faPen,
	},
	[Mode.VIEW]: {
		label: 'View',
		icon: faEye,
	},
}

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

		const nextMode = mode === Mode.VIEW ? Mode.EDIT : Mode.VIEW
		const nextModeData = modes[nextMode]

		function swapMode() {
			setMode(nextMode)
		}

		return (
			<>
				<ContainerHeader>
					<Heading>Rotation</Heading>
					{/* This isn't the _best_ UX, let's be real. Find a better spot? */}
					<div>
						<Heading
							element="button"
							onClick={swapMode}
							className={styles.modeButton}
						>
							<FontAwesomeIcon
								icon={nextModeData.icon}
								className={styles.icon}
							/>
							{nextModeData.label} rotation
						</Heading>
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
