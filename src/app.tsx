import {useAtom} from 'jotai'
import {Edit} from './edit'
import {Mode, modeAtom, serialisedRotationAtom} from './state'
import {AtomUrlPersister} from './utils'
import {View} from './view'

export function App() {
	const [mode] = useAtom(modeAtom)
	const ModeComponent = mode === Mode.EDIT ? Edit : View

	return (
		<>
			<ModeComponent />
			<AtomUrlPersister atom={serialisedRotationAtom} />
		</>
	)
}
