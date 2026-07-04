import React from 'react'
import { ThemeSwitcher } from '@/components/theme-switcher'

const page = () => {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1>Hello World</h1>
      <ThemeSwitcher />
    </div>
  )
}

export default page
