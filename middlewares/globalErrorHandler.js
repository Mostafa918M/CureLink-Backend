const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");

/**
 * DEV: return full error details
 */
const sendErrorForDev = (err, req, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    meta: {
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
    },
  });
};

/**
 * PROD: return safe message only
 */
const sendErrorForProd = (err, req, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.isExpected ? err.message : "Something went wrong!",
    timestamp: new Date().toISOString(),
  });
};

/* ---------------- JWT Error Handlers ---------------- */
const handleJwtInvalidSignature = () =>
  new ApiError("Invalid token, please login again", 401);

const handleJwtExpired = () =>
  new ApiError("Your token has expired, please login again", 401);

/* ---------------- Multer Error Handler ---------------- */
const handleMulterErrors = (err) => {
  if (err.code === "LIMIT_FILE_SIZE")
    return new ApiError("File too large. Maximum size allowed is 10MB", 400);

  if (err.code === "LIMIT_FILE_COUNT")
    return new ApiError("Too many files uploaded", 400);

  if (err.code === "LIMIT_UNEXPECTED_FILE")
    return new ApiError(`Unexpected field: ${err.field}`, 400);

  if (err.code === "LIMIT_PART_COUNT")
    return new ApiError("Too many parts in multipart data", 400);

  if (err.message && err.message.includes("Invalid file type"))
    return new ApiError(
      "Invalid file type. Please upload a supported file format",
      400
    );

  return err;
};

/* ---------------- System Error Handler ---------------- */
const handleSystemErrors = (err) => {
  if (err.code === "ENOENT") return new ApiError("File or directory not found", 404);
  if (err.code === "EACCES") return new ApiError("Permission denied", 403);
  if (err.code === "EMFILE") return new ApiError("Too many open files", 503);
  if (err.code === "ECONNREFUSED") return new ApiError("Connection refused", 503);
  if (err.code === "ETIMEDOUT") return new ApiError("Network operation timed out", 504);
  if (err.code === "EHOSTUNREACH") return new ApiError("Host is unreachable", 503);
  return err;
};

/* ---------------- Mongo/Mongoose Error Handler ---------------- */
const handleMongoErrors = (err) => {

  if (err.name === "ValidationError" && err.errors) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new ApiError(messages.join(". "), 400);
  }

  if (err.name === "CastError") {
    return new ApiError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
    const value = err.keyValue ? err.keyValue[field] : "";
    const msg = value
      ? `Duplicate value for ${field}: ${value}. Please use another value!`
      : "Duplicate value. Please use another value!";
    return new ApiError(msg, 400);
  }

  if (err.name === "MongoNetworkError") {
    return new ApiError("Database connection failed", 503);
  }

  if (err.name === "MongoServerError") {
    return new ApiError("Database server error", 500);
  }

  return err;
};

/* ---------------- Global Error Middleware ---------------- */
const globalError = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  logger.error({
    name: err.name,
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    ip: req.ip,
  });

  if (process.env.NODE_ENV === "development") {
    return sendErrorForDev(err, req, res);
  }

  let error = err;

  if (error.name === "JsonWebTokenError") error = handleJwtInvalidSignature();
  if (error.name === "TokenExpiredError") error = handleJwtExpired();

  if (error.code && String(error.code).startsWith("LIMIT_")) {
    error = handleMulterErrors(error);
  }

  error = handleSystemErrors(error);
  error = handleMongoErrors(error);

  if (!error.isExpected) {
    error = new ApiError("Something went wrong!", 500);
  }

  return sendErrorForProd(error, req, res);
};

/* ---------------- 404 Handler ---------------- */
const handleNotFound = (req, res, next) => {
  next(new ApiError(`Route ${req.originalUrl} not found`, 404));
};

module.exports = { globalError, handleNotFound };
