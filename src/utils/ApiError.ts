class ApiError extends Error {
  statusCode?: number;
  constructor(
    message: string = "something went wrong",
    statusCode?: number,
    errors = [],
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
