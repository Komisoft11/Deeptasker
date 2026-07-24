import React, { FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ITag } from '@/entities/Project'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'

interface Props {
  tags?: ITag[]
  onChange?: (tagIds: number[]) => void
  initialTags?: number[]
}

interface FormValues {
  [key: string]: boolean
}

export const TagsFilter: FC<Props> = ({
  tags = [],
  onChange,
  initialTags = []
}) => {
  const { control, getValues } = useForm<FormValues>({
    values: tags.reduce((acc, tag) => {
      acc[tag.id] = initialTags.includes(tag.id)
      return acc
    }, {} as FormValues)
  })

  const handleCheckboxChange = () => {
    const currentValues = getValues()
    const selectedTagIds = Object.entries(currentValues)
      .filter(([_, value]) => value)
      .map(([key]) => parseInt(key))

    onChange?.(selectedTagIds)
  }

  return (
    <>
      {tags.map((tag) => (
        <Controller
          key={tag.id}
          name={`${tag.id}`}
          control={control}
          render={({ field }) => (
            <Checkbox
              label={tag.name}
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked)
                handleCheckboxChange()
              }}
              classNameLabel={'body-14-20'}
            />
          )}
        />
      ))}
    </>
  )
}
