import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const generateReceipt = (student, payment) => {
  const doc = new jsPDF()

  doc.text('School Fee Receipt', 14, 15)

  doc.autoTable({
    startY: 25,
    body: [
      ['Student', student.name],
      ['Reg No', student.reg_no],
      ['Amount Paid', payment.amount_paid],
      ['Date', payment.payment_date],
      ['Mode', payment.payment_mode],
      ['Receipt No', payment.receipt_no],
    ],
  })

  doc.save(`receipt_${payment.receipt_no}.pdf`)
}
