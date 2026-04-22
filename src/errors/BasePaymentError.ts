export class BasePaymentError extends Error {
  code: number | string;

  constructor(message: string, code: number | string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
