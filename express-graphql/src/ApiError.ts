class ApiError extends Error {
  public constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly innerError?: Error,
  ) {
    super();
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
    if (this.innerError != null && this.innerError.stack != null) {
      this.stack += `\nCaused by: ${this.innerError.stack}`;
    }
  }
}

export default ApiError;
