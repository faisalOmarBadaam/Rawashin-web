
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { useSearchParams } from 'react-router'

type QuerySelectOption = {
  label: string
  value: number | string
}

type QuerySelectFilterProps = {
  queryKey: string
  label: string
  options: readonly QuerySelectOption[]
  allLabel?: string
  width?: number

  pageKey?: string
}

export default function QuerySelectFilter({
  queryKey,
  label,
  options,
  width = 150,
  allLabel = 'الكل',
  pageKey = 'page'
}: QuerySelectFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  const value = searchParams.get(queryKey) ?? ''

  const handleChange = (nextValue: string) => {
    const nextParams = new URLSearchParams(searchParams)

    if (nextValue) {
      nextParams.set(queryKey, nextValue)
    } else {
      nextParams.delete(queryKey)
    }

    nextParams.delete(pageKey)

    setSearchParams(nextParams, { replace: true })
  }

  return (
    <TextField
  select
  label={label}
  value={value}
  onChange={(event) => handleChange(event.target.value)}
  size="small"
  slotProps={{
    inputLabel: {
      shrink: true
    },
    select: {
  displayEmpty: true,
  MenuProps: {
    disableScrollLock: true
  },
  renderValue: (selected) => {
    if (selected === '') return allLabel

    const selectedOption = options.find(
      (option) => String(option.value) === String(selected)
    )

    return selectedOption?.label ?? ''
  }

  }
  }}
  sx={{
    width: { xs: '100%', sm: width }
  }}
>
  <MenuItem value="">
    {allLabel}
  </MenuItem>

  {options.map((option) => (
    <MenuItem key={option.value} value={option.value}>
      {option.label}
    </MenuItem>
  ))}
</TextField>
  )
}