import {Children, ReactNode} from 'react'
import styles from './stack.module.css'

export interface StackProps {
	children?: ReactNode
}

export function Stack({children}: StackProps) {
	return (
		<>
			{Children.map(children, child => (
				<div className={styles.item}>{child}</div>
			))}
		</>
	)
}
