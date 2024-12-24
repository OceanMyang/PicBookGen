export class HttpException extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class InternalServerException extends HttpException {
  constructor(operation?: string) {
    super(500, "An unexpected error occurred" + (operation ? ` when ${operation}.` : "."));
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(400, message);
  }
}

export class ConflictException extends HttpException {
  constructor(name: ExceptionObjectNames, id: number | string) {
    super(409, `${name} ${id} already exists.`);
  }
}

export class NotFoundException extends HttpException {
  constructor(name: string, id?: number | string, message?: string) {
    super(404, `${name + (id ? " " + id : "")} ${message ? message : "is not found."}`);
  }
}

export class DeletedException extends NotFoundException {
  constructor(name: ExceptionObjectNames, id: number | string, deleted: boolean = true) {
    super(name, id, "has already been " + (deleted ? "deleted." : "restored."));
  }
}

export class DataNotFoundException extends NotFoundException {
  constructor(name: ExceptionObjectNames, id: number | string) {
    super(name, id, `doesn't exist in your ${name.toLowerCase()} data.`);
  }
}

export class FileNotFoundException extends NotFoundException {
  constructor(name: ExceptionObjectNames, id: number | string) {
    super(name, id, "is not stored on server.");
  }
}

export class AccessDeniedException extends HttpException {
  constructor(message?: string) {
    super(403, "Access Denied" + (message ? `: ${message}` : "!"));
  }
}

export type ExceptionObjectNames = "Page" | "File" | "Image" | "Script";
