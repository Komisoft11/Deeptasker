import {OnQueueCompleted, Process, Processor} from '@nestjs/bull'
import {Queues, TrelloJobs} from '../../../const'
import {Job} from "bull";
import {ITrelloImportData} from "../producers/trello.producer.service";
import {TrelloImportService} from "../services/trello-import.service";

@Processor(Queues.TRELLO_QUEUE)
export class TrelloConsumer {
    constructor(private readonly trelloProjectImport: TrelloImportService) {
    }

    @Process(TrelloJobs.PROJECT_IMPORT_JOB)
    async process(job: Job<ITrelloImportData>) {
        await this.trelloProjectImport.import(job.data.fileId, job.data.workspaceId, job.data.userId)
    }

    @OnQueueCompleted()
    async onCompleted(job: Job<ITrelloImportData>, result: any) {
        console.log(`Import of trello project finished for workspace: ${job.data.workspaceId}`)

        // TODO send event
    }
}