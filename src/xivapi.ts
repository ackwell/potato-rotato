import {useEffect, useState} from 'react'

// TODO: might be able to just... steal the column system from tooltips to make defining the response shapes less horrible
// Realistically, most of this logic is only relevant to a single component that uses it. This file should be cut back to just xivapi generic utilities,
// with component specific lookup logic moved to that component/package.

// TODO: Handle pagination, internalise this
export interface XivApiListing<T> {
	Results: T[]
}

// TODO: Handle listing pagination?
export const fetchXivapi = <T = any>(request: string): Promise<T> =>
	fetch(`https://xivapi.com/${request}`).then(resp => resp.json())

interface XivApiJob {
	ID: number
	Name: string
	ClassJobParentTargetID: number
	ItemSoulCrystalTargetID: number
	Abbreviation_en: string
}

export interface Job {
	id: number
	name: string
	parentId: number
	classJobCategoryKey: string
}

export function useJobs() {
	const [jobs, setJobs] = useState<Job[]>()
	useEffect(() => {
		fetchXivapi<XivApiListing<XivApiJob>>(
			'ClassJob?columns=ID,Name,ClassJobParentTargetID,ItemSoulCrystalTargetID,Abbreviation_en',
		).then(json => {
			setJobs(
				json.Results.filter(job => job.ItemSoulCrystalTargetID > 0).map(
					job => ({
						id: job.ID,
						name: job.Name,
						parentId: job.ClassJobParentTargetID,
						// This is a relatively tenuous link. Blame miu if it breaks.
						classJobCategoryKey: job.Abbreviation_en,
					}),
				),
			)
		})
	}, [])
	return jobs
}
