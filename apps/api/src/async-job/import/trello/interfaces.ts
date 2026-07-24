export interface ITrelloProject
{
    id: string
    name: string
    desc: string
    url: string
    shortUrl: string
    lists: ITrelloList[]
    cards: ITrelloCard[]
    checklists: ITrelloChecklist[]
    members: ITrelloMember[]
}

interface ITrelloCard
{
    id: string
    name: string
    desc: string
    due?: Date
    closed: boolean
    dueComplete: boolean
    idList: string
    attachments: ITrelloCardAttachment[]
}

interface ITrelloList
{
    id: string
    name: string
    closed: boolean
}

interface ITrelloMember
{
    id: string
    fullName: string
    username: string
}

interface ITrelloCardAttachment
{
    id: string
    idMember: string
    mimeType: string
    name: string
    filename: string
    url: string
    date: Date
    bytes: number
}

interface ITrelloChecklist
{
    id: string
    name: string
    idCard: string
    checkItems: ITrelloCheckItem[]
}

interface ITrelloCheckItem
{
    id: string
    name: string
    due: Date
}