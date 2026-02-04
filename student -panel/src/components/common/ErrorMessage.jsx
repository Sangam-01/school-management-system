import { Alert, AlertTitle, Button } from '@mui/material'

const ErrorMessage = ({ error, onRetry }) => {
  return (
    <Alert 
      severity="error" 
      sx={{ mb: 2 }}
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    >
      <AlertTitle>Error</AlertTitle>
      {error || 'Something went wrong. Please try again.'}
    </Alert>
  )
}

export default ErrorMessage
