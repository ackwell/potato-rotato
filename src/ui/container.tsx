import {ReactNode} from 'react'
import styles from './container.module.css'

export interface ContainerProps {
	children?: ReactNode
}

export function Container({children}: ContainerProps) {
	return <div className={styles.container}>{children}</div>
}

export interface ContainerHeaderProps {
	children?: ReactNode
}

export function ContainerHeader({children}: ContainerHeaderProps) {
	return <div className={styles.header}>{children}</div>
}
