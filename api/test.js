module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API está funcionando!',
    timestamp: new Date().toISOString()
  });
};
