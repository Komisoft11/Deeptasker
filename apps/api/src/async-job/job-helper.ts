import { Job } from 'bull'

export async function waitForJobsToComplete(job: Job, jobComparisonFunction: (job: Job) => boolean): Promise<void> {
	const activeJobs = await job.queue.getActive()

	const sameJobs = activeJobs.filter(jobComparisonFunction)

	if (sameJobs.length > 1) {
		await Promise.all(sameJobs.slice(0, -1).map((j) => j.finished()))
	}
}