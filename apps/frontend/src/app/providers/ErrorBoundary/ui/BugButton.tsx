import { Button } from '@/shared/ui/Button/Button'


// Button for testing ErrorBoundary
export const BugButton = () => {
  const onThrow = () => {
    throw new Error()
  }

  return (
    <Button styleButton={'filled'} onClick={onThrow}>
      333123
    </Button>
  )
}
