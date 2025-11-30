import express from "express";

const router = express.Router();

router.post('/', (req, res) => {
  const { start, destination, route } = req.body;
  console.log('Start:', start);
  console.log('Destination:', destination);
  console.log('Route:', route);

  res.status(200).json({ message: 'Route received successfully' });
});

export default router;
