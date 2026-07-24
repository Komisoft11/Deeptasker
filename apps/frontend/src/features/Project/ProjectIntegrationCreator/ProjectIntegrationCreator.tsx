import {
  BitrixLogo,
  JiraLogo,
  SheetsLogo,
  TrelloLogo
} from '@/shared/assets/images/logos'
import styles from './ProjectIntegrationCreator.module.scss'

export const ProjectIntegrationCreator = () => {
  const logos = [
    <JiraLogo key='jira' />,
    <BitrixLogo key='bitrix' />,
    <SheetsLogo key='sheets' />,
    <TrelloLogo key='trello' />
  ]
  return (
    <div className={styles.container}>
      {logos.map((logo, index) => (
        <div className={styles.item} key={index}>
          {logo}
        </div>
      ))}
    </div>
  )
}
