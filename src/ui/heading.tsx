import {ReactNode, useEffect, useRef, useState} from 'react'
import styles from './heading.module.css'

export interface HeadingProps {
	children?: ReactNode
	id?: string
}

export function Heading({children, id}: HeadingProps) {
	// Headings have a `text-transform: uppercase` on them, which reads poorly in ARIA.
	// Extract the text content of children and set it on the label prop to improve.
	const [childText, setChildText] = useState('')

	const headingRef = useRef<HTMLHeadingElement>(null)
	useEffect(() => {
		setChildText(headingRef.current?.textContent ?? '')
	}, [children])

	return (
		<h2
			ref={headingRef}
			id={id}
			className={styles.heading}
			aria-label={childText}
		>
			{children}
		</h2>
	)
}
