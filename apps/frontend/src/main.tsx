import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import ReactDOM from 'react-dom/client'
import App from '@/app/App'
import { MainProvider } from '@/app/providers/MainProvider'


dayjs.extend(customParseFormat)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <MainProvider>
    <App />
  </MainProvider>
)
