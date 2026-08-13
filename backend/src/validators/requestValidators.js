export function validateLoginInput(email, password) {
  return (
    typeof email === 'string' &&
    email.trim().length > 0 &&
    typeof password === 'string' &&
    password.length > 0
  )
}

export function validateReviewInput(decision) {
  return ['Approve', 'Partial', 'Reject'].includes(decision)
}
