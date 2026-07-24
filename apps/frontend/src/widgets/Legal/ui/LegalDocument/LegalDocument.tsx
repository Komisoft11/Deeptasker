import React, { useEffect, useRef } from 'react'

export type LegalList = {
  type: 'ul' | 'ol'
  items: string[]
}

export type LegalItem = string | LegalList | LegalSubSection

export interface LegalSection {
  title?: string
  items?: LegalItem[]
}

export interface LegalSubSection {
  subTitle: string
  content: string[]
}

export interface LegalDocumentProps {
  mainTitle: string
  subtitle?: string
  version?: string
  date?: string
  intro?: string[]
  sections: LegalSection[]
}

export const LegalDocument = ({
  mainTitle,
  subtitle,
  version,
  date,
  intro,
  sections
}: LegalDocumentProps) => {
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    const handleScroll = () => {
      const center = window.scrollY + window.innerHeight / 2
      let current = 0
      sectionRefs.current.forEach((ref, i) => {
        if (ref) {
          const top = ref.offsetTop
          const bottom = top + ref.offsetHeight
          if (center >= top && center <= bottom) {
            current = i
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className='flex flex-col gap-4'>
      <div className='text-center'>
        <h2 className='uppercase'>{mainTitle}</h2>
        {subtitle && <h3>{subtitle}</h3>}
      </div>

      <div className='fixed top-14 right-4 w-[220px] body-12 flex flex-col gap-2 max-h-[calc(100dvh-64px)] overflow-y-auto scrollbarContainerOnBg'>
        {sections.map((section, i) => (
          <div
            key={i}
            className={
              'text-left w-full rounded-lg py-2 px-3 hover:cursor-pointer hover:bg-hover'
            }
            onClick={() =>
              sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            {section.title}
          </div>
        ))}
      </div>

      {(date || version) && (
        <div className='text-end body-12 flex flex-col gap-0.5'>
          {date && <p>Дата утверждения: {date}</p>}
          {version && <p>Номер версии: {version}</p>}
        </div>
      )}

      {intro?.map((paragraph, i) => (
        <p key={i} className='body-14-20 text-pretty'>
          {paragraph}
        </p>
      ))}

      {sections.map((section, i) => (
        <div
          key={i}
          ref={(el) => (sectionRefs.current[i] = el)}
          className='body-14-20 flex flex-col gap-2 text-pretty'
        >
          {section.title && <h3 className='mt-5 mb-2'>{section.title}</h3>}

          {section.items?.map((item, j) => {
            if (typeof item === 'string') {
              return <p key={j} dangerouslySetInnerHTML={{ __html: item }} />
            }

            if ('type' in item) {
              const ListTag = item.type === 'ol' ? 'ol' : 'ul'
              return (
                <ListTag
                  key={j}
                  className='!list-disc ml-6 flex flex-col gap-1'
                >
                  {item.items.map((text, k) => (
                    <li
                      key={k}
                      className='!list-disc'
                      dangerouslySetInnerHTML={{ __html: text }}
                    />
                  ))}
                </ListTag>
              )
            }

            return (
              <div key={j}>
                <p className='font-semibold'>{item.subTitle}</p>
                <ul className='ml-6'>
                  {item.content.map((c, k) => (
                    <li key={k} dangerouslySetInnerHTML={{ __html: c }} />
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
