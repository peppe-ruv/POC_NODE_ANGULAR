const express = require('express');
const path = require('path');
const apiRoutes = require('./routes');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// API routes
app.use('/api', apiRoutes);

// Serve Angular frontend (static files) - This assumes Angular app is built into a 'dist' or similar folder
// For development, Angular's ng serve handles this. For production on Heroku:
const angularAppPath = path.join(__dirname, '..', 'angular-app', 'dist', 'contatori-app'); // Adjust if Angular output dir is different
app.use(express.static(angularAppPath));

// All other GET requests not handled by API or static files should return the Angular index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(angularAppPath, 'index.html'));
  } else {
    res.status(404).send('API endpoint not found');
  }
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
  console.log('HMAC Secret Key (dev only, ensure this is not logged in prod):', process.env.HMAC_SECRET_KEY || 'supersecretkey (default)');
  console.log('Predefined string for HMAC (dev only):', process.env.PREDEFINED_STRING_TO_HMAC || 'my-fixed-string-for-hmac (default)');
  console.log('Ensure DB environment variables (DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT) are set.');
  console.log('Ensure HMAC_SECRET_KEY and PREDEFINED_STRING_TO_HMAC are set for production.');
});
