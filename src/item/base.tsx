import cx from 'classnames'
import {createContext, ReactNode, useContext} from 'react'
import {Item} from '../state'
import styles from './base.module.css'

export enum View {
	ROTATION,
	OVERLAY,
}

export interface ItemViewProps<I extends Item> {
	item: I
	view: View
}

export type WrapperProps = JSX.IntrinsicElements['div']
export const WrapperContext = createContext<WrapperProps>({})

export interface ItemWrapperProps {
	children?: ReactNode
	className?: string
}
export function ItemWrapper({children, className}: ItemWrapperProps) {
	const wrapperProps = useContext(WrapperContext)

	return (
		<div
			{...wrapperProps}
			className={cx(className, wrapperProps.className, styles.item)}
		>
			{children}
		</div>
	)
}
