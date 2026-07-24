import classNames from 'classnames'
import { FC, useState } from 'react'
import { ColorResult, HSLColor } from 'react-color'
import { colors } from '@/shared/const/colors'
import { hexToRgb } from '@/shared/lib/helpers/color'
import styles from './ColorPalette.module.scss'

interface Props {
  className?: string
  changePaletteColor: (color: ColorResult) => void
  initialColor: string | null
  buttonClassName?: string
}

export const ColorPalette: FC<Props> = ({
  changePaletteColor,
  className,
  buttonClassName,
  initialColor
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(
    initialColor
  )

  const proxyColorChange = (color: string) => {
    changePaletteColor({
      hex: color,
      rgb: hexToRgb(color),
      hsl: {} as HSLColor
    })
    setSelectedColor(color)
  }

  return (
    <div className={classNames(styles.palette, className)}>
      {colors.map((color) => (
        <button
          onClick={() => proxyColorChange(color)}
          key={color}
          type={'button'}
          className={classNames(styles.colorButton, buttonClassName)}
          style={{
            backgroundColor: selectedColor === color ? 'var(--hover)' : color
          }}
        >
          <div
            className={styles.circle}
            style={{
              borderColor: selectedColor !== color ? 'transparent' : color
            }}
          />
        </button>
      ))}
    </div>
  )
}
