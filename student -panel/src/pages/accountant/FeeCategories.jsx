import { useState, useEffect } from 'react'
import { 
  Paper, Typography, Box, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Chip
} from '@mui/material'
import { Add, Edit, Delete, Category } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../utils/constants'

const FeeCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/accountant/fee-categories')
      
      if (response.data.status === 'success') {
        setCategories(response.data.data)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories')
      toast.error('Failed to load fee categories')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditMode(true)
      setCurrentCategory(category)
      reset({
        category_name: category.category_name,
        amount: category.amount
      })
    } else {
      setEditMode(false)
      setCurrentCategory(null)
      reset({ category_name: '', amount: '' })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditMode(false)
    setCurrentCategory(null)
    reset()
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      let response

      if (editMode) {
        // Update existing category
        response = await api.put(`/accountant/fee-categories/${currentCategory.category_id}`, data)
      } else {
        // Create new category
        response = await api.post('/accountant/fee-categories/add', data)
      }

      if (response.data.status === 'success') {
        toast.success(editMode ? 'Category updated successfully' : 'Category added successfully')
        handleCloseDialog()
        fetchCategories()
      } else {
        toast.error(response.data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this fee category?')) {
      return
    }

    try {
      const response = await api.delete(`/accountant/fee-categories/${categoryId}`)
      
      if (response.data.status === 'success') {
        toast.success('Category deleted successfully')
        fetchCategories()
      } else {
        toast.error(response.data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category')
    }
  }

  if (loading) return <LoadingSpinner message="Loading categories..." />
  if (error) return <ErrorMessage error={error} onRetry={fetchCategories} />

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Fee Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Category />
          All Fee Categories
        </Typography>

        {categories && categories.length > 0 ? (
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Category Name</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.category_id} hover>
                    <TableCell>{category.category_id}</TableCell>
                    <TableCell>
                      <Chip label={category.category_name} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight={600}>
                        {formatCurrency(category.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(category)}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(category.category_id)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No fee categories found. Click "Add Category" to create one.
          </Typography>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Fee Category' : 'Add Fee Category'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField
              fullWidth
              label="Category Name"
              margin="normal"
              {...register('category_name', { 
                required: 'Category name is required',
                minLength: { value: 3, message: 'Minimum 3 characters required' }
              })}
              error={!!errors.category_name}
              helperText={errors.category_name?.message}
              disabled={submitting}
            />
            <TextField
              fullWidth
              label="Amount (₹)"
              type="number"
              margin="normal"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 1, message: 'Amount must be greater than 0' }
              })}
              error={!!errors.amount}
              helperText={errors.amount?.message}
              disabled={submitting}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Saving...' : editMode ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default FeeCategories