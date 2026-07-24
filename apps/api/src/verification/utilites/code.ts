import { randomInt } from 'crypto'

const VERIFICATION_CODE_LENGTH: number = 6

export const generateVerificationCode = (): string => {
	const codes: number[] = []

	for (let i = 0; i < VERIFICATION_CODE_LENGTH; i++) {
		codes[i] = randomInt(0, 10)
	}

	return codes.join('')
}
