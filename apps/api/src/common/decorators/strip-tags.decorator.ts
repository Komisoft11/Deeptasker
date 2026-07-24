import { encode } from 'html-entities'

export function encodeHtmlTags(data: {}): any {
	for (let prop in data) {
		if (typeof data[prop] === 'string') {
			data[prop] = encode(data[prop].trim());
		}
	}

	return data
}
