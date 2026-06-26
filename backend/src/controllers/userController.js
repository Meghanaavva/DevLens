export const getProfile = (req, res) => {
  res.json({ id: req.user.id, message: 'Profile fetched' })
}

export const updateProfile = (req, res) => {
  const { name } = req.body
  res.json({ message: 'Profile updated', name })
}

export const deleteAccount = (req, res) => {
  res.json({ message: 'Account deleted' })
}