import {column, Data, useGameData} from '@xivanalysis/tooltips'

// This file contains sheet defintions shared throughout the system, to help cut down on re-requesting duplicate info

const GCD_COOLDOWN_GROUP = 58

export class ActionData extends Data {
	@column('Name') name!: string
	@column('Icon', {type: 'url'}) icon!: string
	@column('CooldownGroup') private cooldownGroup!: number
	// TODO: This hasn't been released on xivapi yet. swap to ! once it has been.
	@column('AdditionalCooldownGroup') private additionalCooldownGroup?: number

	get onGcd() {
		return [this.cooldownGroup, this.additionalCooldownGroup].includes(
			GCD_COOLDOWN_GROUP,
		)
	}
}

export const useActionData = (id: number) =>
	useGameData({
		sheet: 'Action',
		columns: ActionData,
		id,
	})
