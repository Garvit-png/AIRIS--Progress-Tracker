module.exports = (req, res) => {
  res.status(200).json({ status: 'Minimal API is working', timestamp: new Date().toISOString() });
};
