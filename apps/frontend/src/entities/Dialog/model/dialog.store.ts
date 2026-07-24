import { makeAutoObservable } from 'mobx'
import { DeleteDialog, ErrorDialog } from './dialogs'


export class DialogStore {
  private readonly _errorDialog: ErrorDialog
  private readonly _deleteDialog: DeleteDialog

  get errorDialog(): ErrorDialog {
    return this._errorDialog
  }

  get deleteDialog(): DeleteDialog {
    return this._deleteDialog
  }

  constructor() {
    this._errorDialog = new ErrorDialog()
    this._deleteDialog = new DeleteDialog()
    makeAutoObservable(this)
  }
}
