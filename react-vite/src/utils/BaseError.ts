class BaseError extends Error {
  userFacing: boolean;

  public constructor(props: {
    message: string,
    userFacing: boolean,
    innerError?: Error,
  }) {
    super();
    this.message = props.message;
    this.userFacing = props.userFacing;
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(props.message)).stack;
    }
    if (props.innerError != null && props.innerError.stack != null) {
      this.stack += `\nCaused by: ${props.innerError.stack}`;
    }
  }
}

export default BaseError;
