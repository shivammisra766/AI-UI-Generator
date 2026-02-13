import { AppError } from "../utils/AppError.js";

const errorHandler = (err, req, res, next) => {
  console.error("Server Error:", err);

  // If it's a known operational error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        type: err.type,
        message: err.message
      }
    });
  }

  // Handle common AI-related errors
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      error: {
        type: "RATE_LIMIT",
        message: "Model rate limit reached. Please try again later."
      }
    });
  }

  if (err.status === 401) {
    return res.status(401).json({
      success: false,
      error: {
        type: "AUTH_ERROR",
        message: "Invalid or expired API key."
      }

    });
  }

  if (err.type === "GENERATION_LIMIT_REACHED") {
  return res.status(429).json({
    success: false,
    error: {
      type: err.type,
      message: err.message
    }
  });
}


  // Unknown / system error
  res.status(500).json({
    success: false,
    error: {
      type: "INTERNAL_SERVER_ERROR",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong"
    }
  });
};

export default errorHandler;
