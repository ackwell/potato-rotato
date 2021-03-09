import capsize from 'capsize'
import {ReactNode} from 'react'
import styles from './heading.module.css'

const fontMetrics = {
	capHeight: 626,
	ascent: 958,
	descent: -475,
	lineGap: 0,
	unitsPerEm: 1000,
}

// TODO: Pull in value as rem scalar from global theme thing
const headingStyles = capsize({fontMetrics, capHeight: 16, lineGap: 8})

export interface HeadingProps {
	children?: ReactNode
}

export function Heading({children}: HeadingProps) {
	return (
		<h2 className={styles.heading} style={headingStyles}>
			{children}
		</h2>
	)
}
