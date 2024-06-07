import { HttpException, HttpStatus } from "@nestjs/common";

export class ValidationException extends HttpException {
  constructor(response: {}) {
    const res = {
      statusCode: HttpStatus.BAD_REQUEST,
      messages: response
    }
    super(res, HttpStatus.BAD_REQUEST);
  }
}