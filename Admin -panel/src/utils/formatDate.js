export const formatDate = (dateStr) => {
    if (!dateStr) return ''
  
    const date = new Date(dateStr)
  
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }
  