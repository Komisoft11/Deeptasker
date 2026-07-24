// import classNames from 'classnames'
// import { observer } from 'mobx-react-lite'
// import { DetailedHTMLProps, FC, HTMLAttributes } from 'react'
// import styled from 'styled-ui'
// import { Workspace } from '@/entities/Workspace'
// import { useRootStore } from '@/shared/lib/hooks/useRootStore'
// import styles from './WorksapceItem.module.scss'
//
//
// interface Props
//   extends Pick<
//     DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
//     'className' | 'onClick'
//   > {
//   workspace: Workspace
// }
//
// export const WorkspaceItem: FC<Props> = observer(
//   ({ workspace, className, ...props }) => {
//     const {
//       workspaceStore: { activeWorkspace }
//     } = useRootStore()
//
//     const getShortTitle = (): string => {
//       const title = workspace.title
//       const parts = title.split(' ')
//       return (
//         parts[0][0].toUpperCase() +
//         (parts[1] !== undefined && parts[1][0] !== undefined
//           ? parts[1][0].toUpperCase()
//           : '')
//       )
//     }
//     const isActive = activeWorkspace.id === workspace.id
//
//     return (
//       <>
//         <div className={classNames(styles.container, className)} {...props}>
//           <div className={styles.item}>
//             <Square>{getShortTitle()}</Square>
//             <div className={styles.info}>
//               <span className={styles.title}>{workspace.title}</span>
//               <span className={styles.description}>
//                 {workspace.members.length + 1} человек · admin
//               </span>
//             </div>
//           </div>
//           {isActive && <SelectedIcon width={16} height={16} />}
//         </div>
//         {/*{isActive && <WorkspaceActions workspace={workspace} />}*/}
//       </>
//     )
//   }
// )
//
// const Square = styled.div`
//   width: 2rem;
//   height: 2rem;
//   color: #303640;
//   border: 1px solid #acbdd3;
//   border-radius: 4px;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   font-size: 0.75rem;
// `
