import 'dotenv/config';
import { connectDB } from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[Server] Live health check available at: http://localhost:${PORT}/`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Server] Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
