export function cleanUndefined(obj: object) {
	Object.keys(obj).forEach(key => {
		if (obj[key] === undefined) {
			delete obj[key]
		}
	})

	return obj
}

export function arrayToObject<T>(arr: string[], value: T): { [key: string]: T } {
	return arr.reduce((acc, curr) => {
		acc[curr] = value;
		return acc;
	}, {} as { [key: string]: T });
}

export function isObjectEmpty(obj: object|null|undefined): boolean {
	if (obj === null || obj === undefined) return true

	return Object.keys(obj).length === 0 && obj.constructor === Object;
}