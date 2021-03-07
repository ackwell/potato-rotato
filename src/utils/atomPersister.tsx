import {useAtom, WritableAtom} from 'jotai'
import {useCallback, useEffect} from 'react'

export interface AtomUrlPersisterProps {
	atom: WritableAtom<string, string>
}

export function AtomUrlPersister({atom}: AtomUrlPersisterProps) {
	const [serialised, hydrate] = useAtom(atom)

	// URL -> State
	const onHashChange = useCallback(() => {
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
		window.location.hash = serialised
	}, [serialised])

	return null
}
