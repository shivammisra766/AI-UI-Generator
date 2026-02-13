export class AppError extends Error {
  constructor(type, message, statusCode = 400) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
