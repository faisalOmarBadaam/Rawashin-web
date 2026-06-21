import * as React from 'react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ar'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

type CustomDatePickerProps = {
  value?: Dayjs | null
  label?: string
  onChange?: (newValue: Dayjs | null) => void
}

export default function CustomDatePicker({
  value: controlledValue,
  label,
  onChange,
}: CustomDatePickerProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<Dayjs | null>(dayjs('2023-04-17'))

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const handleChange = (newValue: Dayjs | null) => {
    if (!isControlled) {
      setUncontrolledValue(newValue)
    }

    onChange?.(newValue)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
      <DatePicker
        value={value}
        label={label ?? 'اختر التاريخ'}
        onChange={handleChange}
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
          },
          nextIconButton: { size: 'small' },
          previousIconButton: { size: 'small' },
        }}
        views={['day', 'month', 'year']}
      />
    </LocalizationProvider>
  )
}