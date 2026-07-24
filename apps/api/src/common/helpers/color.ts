import randomColor from 'randomcolor'
import tinycolor from 'tinycolor2'

export function generateRandomBgColor(): string {
	return randomColor()
}

export function generateFgColorForBg(bgColor: string): string {
	return '#' + tinycolor
		.mostReadable(bgColor, ['#ffffff', '#000000'], { includeFallbackColors: true })
		.toHex()
}
