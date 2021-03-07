import {useAtom, WritableAtom} from 'jotai'
import {useCallback, useEffect, useRef} from 'react'

export interface AtomUrlPersisterProps {
	atom: WritableAtom<string, string>
}

export function AtomUrlPersister({atom}: AtomUrlPersisterProps) {
	const [serialised, hydrate] = useAtom(atom)
	// Updating the hash to persist will also trip the hashchange event. To avoid propagating the thrash into the hydrating atom, we track updates and ignore events resulting from one.
	const thrashing = useRef(false)

	// URL -> State
	const onHashChange = useCallback(() => {
		if (thrashing.current) {
			thrashing.current = false
			return
		}

		const hash = window.location.hash.replace(/^#/, '')
		if (hash === '') {
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
		thrashing.current = true
		window.location.hash = serialised
	}, [serialised])

	return null
}
