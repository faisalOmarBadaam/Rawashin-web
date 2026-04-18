'use client'

import Button from '@mui/material/Button'

export type FilterResetButtonProps = {
  onReset: () => void
  disabled?: boolean
}

export default function FilterResetButton({ onReset, disabled = false }: FilterResetButtonProps) {
  return (
    <Button
      size="small"
      variant="outlined"
      color="inherit"
      startIcon={<i className="ri-refresh-line" />}
      onClick={onReset}
      disabled={disabled}
    >
      إعادة تعيين
    </Button>
  )
}
