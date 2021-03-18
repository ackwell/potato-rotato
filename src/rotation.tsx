import {useAtom} from 'jotai'
import {ComponentType, forwardRef} from 'react'
import styles from './rotation.module.css'
import {Item, itemFamily, rotationAtom} from './state'
import {Heading, Container, ContainerHeader} from './ui'

export interface RotationItemProps {
	id: string
	item: Item
}

export interface RotationProps {
	Item: ComponentType<RotationItemProps>
}

export const Rotation = forwardRef<HTMLDivElement, RotationProps>(
	function Rotation({Item}, ref) {
		const [ids] = useAtom(rotationAtom)

		return (
			<>
				<ContainerHeader>
					<Heading>Rotation</Heading>
				</ContainerHeader>
				<Container>
					<div ref={ref} className={styles.rotation}>
						{ids.map(id => (
							<ResolveItemId key={id} id={id} Item={Item} />
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
