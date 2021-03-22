import cx from 'clsx'
import {createElement} from 'react'
import styles from './heading.module.css'

type Level = 1 | 2 | 3 | 4 | 5 | 6

const fontClass = new Map<Level, string>([
	[2, styles.level2],
	[3, styles.level3],
])

type Elements = keyof JSX.IntrinsicElements
// prettier-ignore
export type HeadingProps<L extends Level, E extends Elements> = 
	& JSX.IntrinsicElements[E] 
	& { level?: L, element?: E }

export function Heading<L extends Level = 2, E extends Elements = `h${L}`>({
	level,
	element,
	children,
	...props
}: HeadingProps<L, E>) {
	const x = level ?? 2
	return createElement(
		element ?? `h${x}`,
		{
			...props,
			className: cx(props.className, styles.heading, fontClass.get(x)),
		},
		children,
	)
}
