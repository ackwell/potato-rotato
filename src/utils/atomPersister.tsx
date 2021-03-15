import {useAtom, WritableAtom} from 'jotai'
import {useCallback, useEffect, useRef} from 'react'

export interface AtomUrlPersisterProps {
	atom: WritableAtom<string, string>
}

export function AtomUrlPersister({atom}: AtomUrlPersisterProps) {
	const [serialised, hydrate] = useAtom(atom)
	// Updating the hash to persist will also trip the hashchange event. To avoid propagating the thrash into the hydrating atom, we track updates and ignore events resulting from one.
	const knownHash = useRef<string>()

	// URL -> State
	const onHashChange = useCallback(() => {
		const hash = window.location.hash.replace(/^#/, '')
		if (hash === '' || knownHash.current === hash) {
			return
		}

		hydrate(hash)
	}, [hydrate])

	useEffect(() => {
		onHashChange()
		window.addEventListener('hashchange', onHashChange)
		return () => window.removeEventListener('hashchange', onHashChange)
	}, [onHashChange])

	// State -> URL
	useEffect(() => {
		knownHash.current = serialised
		window.location.hash = serialised
	}, [serialised])

	return null
}
