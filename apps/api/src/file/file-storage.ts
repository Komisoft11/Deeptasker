type validFileExtension =
	| 'png'
	| 'jpg'
	| 'jpeg'
	| 'pdf'
	| 'doc'
	| 'docx'
	| 'txt'
	| 'ods'
	| 'xls'
	| 'xlsx'
	| 'csv'
	| 'rar'
	| 'zip'
type validImageExtension = '.png' | '.jpg' | '.jpeg'
export type ValidMimeType =
	| 'image/png'
	| 'image/jpg'
	| 'image/jpeg'
	| 'application/msword'
	| 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
	| 'application/vnd.ms-excel'
	| 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	| 'application/pdf'
	| 'text/csv'
	| 'application/vnd.oasis.opendocument.spreadsheet'
	| 'text/plain'
	| 'application/x-rar-compressed'
	| 'application/octet-stream'
	| 'application/zip'
	| 'application/x-zip-compressed'
	| 'multipart/x-zip'
	| 'application/gzip'

export const maxFileSize = 10 * 1024 * 1024

const validImageExtensions: validImageExtension[] = ['.png', '.jpg', '.jpeg']

export const validFileExtensions: validFileExtension[] = [
	'png',
	'jpg',
	'jpeg',
	'pdf',
	'doc',
	'docx',
	'txt',
	'ods',
	'xls',
	'xlsx',
	'csv',
	'zip',
	'rar'
]
const validMimeTypes: ValidMimeType[] = [
	'image/png',
	'image/jpg',
	'image/jpeg',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/pdf',
	'text/csv',
	'application/vnd.oasis.opendocument.spreadsheet',
	'text/plain',
	'application/x-rar-compressed',
	'application/octet-stream',
	'application/zip',
	'application/octet-stream',
	'application/x-zip-compressed',
	'multipart/x-zip',
	'application/gzip'
]
