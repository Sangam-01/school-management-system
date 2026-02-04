import {
    Box,
    Button,
    Card,
    CardContent,
    MenuItem,
    Select,
    TextField,
    Typography,
  } from '@mui/material'
  import { useState } from 'react'
  import api from '../../api/axios'
  import { generateReceipt } from '../../utils/feeReceipt'
  
  const FeePayments = () => {
    const [form, setForm] = useState({
      enrollment_id: '',
      amount_paid: '',
      payment_date: '',
      payment_mode: 'Cash',
      receipt_no: '',
    })
  
    const submit = () => {
      api.post('/admin/fees/payment', form).then(() => {
        generateReceipt(
          { name: 'Student', reg_no: form.enrollment_id },
          form
        )
        alert('Payment successful')
      })
    }
  
    return (
      <Box>
        <Typography variant="h5">Fee Payment</Typography>
  
        <Card sx={{ maxWidth: 500, mt: 2 }}>
          <CardContent>
            <TextField
              label="Enrollment ID"
              fullWidth
              margin="normal"
              value={form.enrollment_id}
              onChange={e =>
                setForm({ ...form, enrollment_id: e.target.value })
              }
            />
  
            <TextField
              label="Amount Paid"
              fullWidth
              margin="normal"
              type="number"
              value={form.amount_paid}
              onChange={e =>
                setForm({ ...form, amount_paid: e.target.value })
              }
            />
  
            <TextField
              type="date"
              fullWidth
              margin="normal"
              value={form.payment_date}
              onChange={e =>
                setForm({ ...form, payment_date: e.target.value })
              }
            />
  
            <Select
              fullWidth
              value={form.payment_mode}
              onChange={e =>
                setForm({ ...form, payment_mode: e.target.value })
              }
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Bank">Bank</MenuItem>
            </Select>
  
            <TextField
              label="Receipt No"
              fullWidth
              margin="normal"
              value={form.receipt_no}
              onChange={e =>
                setForm({ ...form, receipt_no: e.target.value })
              }
            />
  
            <Button variant="contained" fullWidth onClick={submit}>
              Collect Fee & Print Receipt
            </Button>
          </CardContent>
        </Card>
      </Box>
    )
  }
  
  export default FeePayments
  