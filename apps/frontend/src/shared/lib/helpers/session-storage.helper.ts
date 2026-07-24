interface IStorageItems {
  editorDraftKey: (id: string | number) => string
}

export const SessionStorageItems: IStorageItems = {
  editorDraftKey: (id: string | number) => `editorDraft_${id}`
}

export const SessionStorageHelper = {
  getEditorDraft(id: string | number): string {
    return sessionStorage.getItem(SessionStorageItems.editorDraftKey(id)) || ''
  },

  setEditorDraft(id: string | number, draft: string): void {
    sessionStorage.setItem(SessionStorageItems.editorDraftKey(id), draft)
  },

  hasDraft(id: string | number): boolean {
    return Boolean(
      sessionStorage.getItem(SessionStorageItems.editorDraftKey(id))
    )
  },

  clearDraft(id: string | number): void {
    sessionStorage.removeItem(SessionStorageItems.editorDraftKey(id))
  },

  clear(): void {
    sessionStorage.clear()
  }
}
