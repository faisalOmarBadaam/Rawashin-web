import { useState, type ReactNode } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useSearchParams } from 'react-router'

type QueryFiltersBarProps = {
  children?: ReactNode
  searchKey?: string
  searchPlaceholder?: string
  resetKeys: string[]
  pageKey?: string
  debounceMs?: number
}

export default function QueryFiltersBar({
  children,
  searchKey = 'search',
  searchPlaceholder = 'بحث',
  resetKeys,
  pageKey = 'page',
  debounceMs = 400
}: QueryFiltersBarProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchValue, setSearchValue] = useState(() => {
    return searchParams.get(searchKey) ?? ''
  })

  const updateSearchParam = useDebouncedCallback((value: string) => {
    const nextParams = new URLSearchParams(searchParams)

    if (value.trim()) {
      nextParams.set(searchKey, value.trim())
    } else {
      nextParams.delete(searchKey)
    }

    nextParams.delete(pageKey)

    setSearchParams(nextParams, { replace: true })
  }, debounceMs)

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    updateSearchParam(value)
  }

  const handleReset = () => {
    updateSearchParam.cancel()

    const nextParams = new URLSearchParams(searchParams)

    nextParams.delete(searchKey)
    nextParams.delete(pageKey)

    resetKeys.forEach((key) => {
      nextParams.delete(key)
    })

    setSearchValue('')
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.25,
        alignItems: 'center',
        width: '100%',
        mb : '20px'
      }}
    >
      <TextField
        value={searchValue}
        onChange={(event) => handleSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        size="small"
        sx={{
          minWidth: { xs: '100%', md: 360 },
          flex: 1
        }}
        slotProps={{
  input: {
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    )
  }
}}
      />

      {children}

      <Button
        variant="outlined"
        onClick={handleReset}
        startIcon={<RefreshIcon />}
        sx={{
          height: 40,
          whiteSpace: 'nowrap'
        }}
      >
        إعادة تعيين
      </Button>
    </Box>
  )
}