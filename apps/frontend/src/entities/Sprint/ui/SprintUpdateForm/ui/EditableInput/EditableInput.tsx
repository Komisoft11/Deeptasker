import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { usePermissionProject } from '@/entities/Project'
import { Edit } from '@/shared/assets/images/icons'
import { TRANSLATION } from '@/shared/const/translation'
import { Input } from '@/shared/ui/Input/Input'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'

interface EditableInputProps {
  field: any
  onEnter: () => void
  readOnly: boolean
  onEdit: () => void
  type: 'title' | 'description'
}

export const EditableInput = forwardRef<HTMLInputElement, EditableInputProps>(
  ({ field, readOnly, onEdit, onEnter, type }, ref) => {
    const {
      permissions: { updateSprints }
    } = usePermissionProject()

    const { t } = useTranslation([TRANSLATION])
    const isTitle = type === 'title'

    return (
      <Input
        {...field}
        ref={ref}
        placeholder={
          isTitle
            ? (t('addNewName', { ns: TRANSLATION }) as string)
            : (t('addNewDescription', { ns: TRANSLATION }) as string)
        }
        label={
          isTitle
            ? t('name', { ns: TRANSLATION })
            : t('description', { ns: TRANSLATION })
        }
        className={isTitle ? 'w-1/4' : 'w-2/4'}
        containerClassName={readOnly && '!pr-0 focus-within:!outline-none'}
        autoComplete={'off'}
        readOnly={readOnly}
        disabled={!updateSprints}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onEnter()
          }
        }}
      >
        {!readOnly && (
          <KbdElement
            kdb={'Enter'}
            tooltipContent={
              isTitle
                ? t('changeName', { ns: TRANSLATION })
                : t('changeDescription', { ns: TRANSLATION })
            }
          />
        )}
        {readOnly && updateSprints && (
          <div
            className='iconContainer h-10 flex items-center justify-center'
            onClick={onEdit}
          >
            <Edit className='icon w-4 h-4' />
          </div>
        )}
      </Input>
    )
  }
)