import { observer } from 'mobx-react-lite'
import { FC, ReactNode } from 'react'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { Dialog } from '@/shared/ui/Dialog/Dialog'

export const DeleteDialog = observer(() => {
  const {
    dialogStore: { deleteDialog }
  } = useRootStore()

  const adapterChangeVisible = () => {
    deleteDialog.clear()
  }

  const adapterDelete = async () => {
    if (!deleteDialog.deleteFunction) return
    await deleteDialog.deleteFunction()
    deleteDialog.clear()
  }

  return (
    <Dialog onOpenChange={adapterChangeVisible} open={!!deleteDialog.title}>
      <Dialog.Content
        title={deleteDialog.title as string}
        className={'h-max w-[700px]'}
      >
        {deleteDialog.body as ReactNode}
        <div className={'flex pt-6'}>
          <Button
            styleButton={'outline'}
            colorButton={'red'}
            loading={deleteDialog.loading}
            onClick={adapterDelete}
            className={'px-3 py-2 body-16'}
          >
            {deleteDialog.buttonText as string}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  )
})
