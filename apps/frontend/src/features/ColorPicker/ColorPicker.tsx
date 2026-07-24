import { observer } from 'mobx-react-lite'
import {
  DetailedHTMLProps,
  FC,
  InputHTMLAttributes,
  useEffect,
  useRef,
  useState
} from 'react'
import { Color, ColorResult, RGBColor } from 'react-color'
import { ColorPalette } from '@/features/ColorPalette /ColorPalette'
import { hexToRgb, rgbToHex } from '@/shared/lib/helpers/color'

interface Props
  extends Omit<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    'ref'
  > {
  setColor: (color: string) => void
  classNamePalette?: string
  isForTags?: boolean
  initialColor: string | null
  buttonClassName?: string
}

export const ColorPicker: FC<Props> = observer(
  ({ setColor, buttonClassName, classNamePalette, initialColor }) => {
    const [localStateColor, setLocalStateColor] = useState<Color | undefined>(
      ''
    )

    useEffect(() => {
      if (localRef.current) {
        const el = localRef.current
        if (!localStateColor && el.value) {
          const rba = hexToRgb(el.value)
          setLocalStateColor(rba)
        } else if (
          localStateColor &&
          rgbToHex(localStateColor as RGBColor) !== el.value
        ) {
          const rba = hexToRgb(el.value)
          setLocalStateColor(rba)
        }
      }
    }, [])

    const changeColor = (colorResult: ColorResult) => {
      setLocalStateColor(colorResult.rgb)
      setColor(colorResult.hex)
    }

    const localRef = useRef<HTMLInputElement>(null)

    return (
      <ColorPalette
        initialColor={initialColor}
        className={classNamePalette}
        changePaletteColor={changeColor}
        buttonClassName={buttonClassName}
      />
    )
  }
)
