import {Header} from './header'
import {ItemView, View as ViewMode} from './item'
import {Rotation, RotationItemProps} from './rotation'
import {Stack} from './ui'

export function View() {
	return (
		<Stack>
			<Header />
			<Rotation Item={ViewItem} />
		</Stack>
	)
}

function ViewItem({id, item}: RotationItemProps) {
	return <ItemView item={item} view={ViewMode.VIEW} />
}
