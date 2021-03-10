import {ReactNode} from 'react'
import styles from './heading.module.css'

export interface HeadingProps {
	children?: ReactNode
}

export function Heading({children}: HeadingProps) {
	return <h2 className={styles.heading}>{children}</h2>
}
