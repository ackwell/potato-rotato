import {Edit} from './edit'
import {serialisedRotationAtom} from './state'
import {AtomUrlPersister} from './utils'

export function App() {
	return (
		<>
			<Edit />

			<AtomUrlPersister atom={serialisedRotationAtom} />
		</>
	)
}
