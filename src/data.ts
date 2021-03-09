import {column, Data, useGameData} from '@xivanalysis/tooltips'

// This file contains sheet defintions shared throughout the system, to help cut down on re-requesting duplicate info

export class ActionData extends Data {
	@column('Name') name!: string
	@column('Icon', {type: 'url'}) icon!: string
}

export const useActionData = (id: number) =>
	useGameData({
		sheet: 'Action',
		columns: ActionData,
		id,
	})
