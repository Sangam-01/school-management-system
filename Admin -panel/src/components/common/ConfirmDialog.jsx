import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
  } from '@mui/material'
  
  const ConfirmDialog = ({
    open,
    title,
    message,
    onConfirm,
    onClose,
  }) => {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{message}</DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button color="error" onClick={onConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
  
  export default ConfirmDialog
  