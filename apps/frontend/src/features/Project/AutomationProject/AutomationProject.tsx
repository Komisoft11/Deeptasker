import { FC } from 'react'
import { IAutomationProject } from '@/entities/Project'
import { Switch } from '@/shared/ui/Switch/Switch'


interface Props {
  defaultValues?: IAutomationProject
  onChange?: (name: keyof IAutomationProject, checked: boolean) => void
}

export const AutomationProject: FC<Props> = ({ onChange, defaultValues }) => {
  return (
    <div>
      <Switch
        defaultChecked={defaultValues?.selfReferral}
        onCheckedChange={(checked) => onChange?.('selfReferral', checked)}
        label={'Автоназначение на себя'}
      />
      <Switch
        defaultChecked={defaultValues?.addTag}
        onCheckedChange={(checked) => onChange?.('addTag', checked)}
        label={'Добавление тега'}
      />
      <Switch
        defaultChecked={defaultValues?.repeatTask}
        onCheckedChange={(checked) => onChange?.('repeatTask', checked)}
        label={'Повторная задача'}
      />
      <Switch
        defaultChecked={defaultValues?.statusUpdate}
        onCheckedChange={(checked) => onChange?.('statusUpdate', checked)}
        label={'Обновление статуса'}
      />
      <Switch
        defaultChecked={defaultValues?.sendToEmail}
        onCheckedChange={(checked) => onChange?.('sendToEmail', checked)}
        label={'Отправление на почту'}
      />
    </div>
  )
}
