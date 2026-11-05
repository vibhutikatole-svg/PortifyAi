const app = require('./app');
const { connectDB } = require('./config/db');
const config = require('./config/env');

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const PORT = config.port;
    const server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 Portify AI Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${config.nodeEnv}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`=========================================`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection]: ${err.message}`);
    });
  } catch (error) {
    console.error(`Failed to launch server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

