export function getCookieValue(cookiesString: string, cookieKey: string) {
	const cookies = cookiesString?.split(';')

	if (!cookies) {
		return null
	}

	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim()
		if (cookie.startsWith(`${cookieKey}=`)) {
			return cookie.substring(cookieKey.length + 1)
		}
	}
	return null
}