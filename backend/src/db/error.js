// Database Error Handler
const handleDatabaseError = (error) => {
  let message = 'An error occurred';
  let statusCode = 500;

  if (error.code === 'ER_DUP_ENTRY') {
    message = 'This record already exists';
    statusCode = 409;
  } else if (error.code === 'ER_NO_REFERENCED_ROW') {
    message = 'Referenced record not found';
    statusCode = 404;
  } else if (error.code === 'ER_BAD_FIELD_ERROR') {
    message = 'Invalid field';
    statusCode = 400;
  } else if (error.message.includes('Connection')) {
    message = 'Database connection failed';
    statusCode = 503;
  }

  return {
    statusCode,
    message,
    error: process.env.NODE_ENV === 'development' ? error : {}
  };
};

module.exports = {
  handleDatabaseError
};
