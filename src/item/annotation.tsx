import {faArrowLeft} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {AnnotationItem} from '../state'
import {ItemViewProps, ItemWrapper, PaletteInfo, View} from './base'

export function AnnotationItemView({view}: ItemViewProps<AnnotationItem>) {
	// TODO: I'm going to need to find some way to persist changes made at this level all the way up at the rotation atom. That could get spicy. Quickly.
	// I guess at EOD i've actually done myself a massive favour by mistake, in making the id->item mapping an atomFamily.
	// Simplest solution is likely to either a) wire the setAtom function down from where we useAtom(itemFamily(id)), or pass the atom itself down and useAtom in these views
	// Consider.

	if (view === View.PALETTE) {
		return (
			<PaletteInfo
				icon={<FontAwesomeIcon icon={faArrowLeft} />}
				name="Annotation"
			/>
		)
	}

	return (
		<ItemWrapper>
			<div style={{height: '5rem', background: 'red'}}>wip</div>
		</ItemWrapper>
	)
}
