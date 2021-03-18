import cx from 'classnames'
import {createContext, ReactNode, useContext} from 'react'
import {Item} from '../state'
import styles from './base.module.css'

export enum View {
	EDIT,
	VIEW,
	OVERLAY,
	PALETTE,
}

export interface ItemViewProps<I extends Item> {
	item: I
	view: View
}

export interface PaletteInfoProps {
	icon: ReactNode
	name: string
}

export function PaletteInfo({icon, name}: PaletteInfoProps) {
	return (
		<ItemWrapper className={styles.info}>
			{icon}
			<span className={styles.infoName}>{name}</span>
		</ItemWrapper>
	)
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
