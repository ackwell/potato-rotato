import cx from 'clsx'
import {createElement, ReactNode} from 'react'
import styles from './heading.module.css'

const fontClass = new Map([
	[2, styles.level2],
	[3, styles.level3],
])

export interface HeadingProps {
	children?: ReactNode
	id?: string
	level?: number
}

export function Heading({children, id, level = 2}: HeadingProps) {
	return createElement(
		`h${level}`,
		{id, className: cx(styles.heading, fontClass.get(level))},
		children,
	)
}
