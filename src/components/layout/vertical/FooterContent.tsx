'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports


// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks


  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <Link href='#' target='_blank' className='text-primary capitalize'>
          رواشن
        </Link>
        <span>{` - `}</span>
        <span>{`جميع الحقوق محفوظة`}</span>

        <span className='text-textSecondary' suppressHydrationWarning>{` © ${new Date().getFullYear()}`}</span>



      </p>

    </div>
  )
}

export default FooterContent
