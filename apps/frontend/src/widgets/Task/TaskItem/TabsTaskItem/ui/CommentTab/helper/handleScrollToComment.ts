export const handleScrollToComment = (replyId: number) => {
  const element = document.getElementById(`comment-${replyId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    element.classList.add('bg-objects')
    element.classList.add('rounded-lg')

    setTimeout(() => {
      element.classList.remove('bg-objects')
      element.classList.remove('rounded-lg')
    }, 1500)
  }
}
