/**
 * Error handling types for Chrome emulation
 */

export type ErrorCategory = 'initialization' | 'runtime' | 'emulation';

export class EmulationError extends Error {
  constructor(
    message: string,
    public category: ErrorCategory,
    public component: string,
    public recoverable: boolean = false
  ) {
    super(message);
    this.name = 'EmulationError';
  }
}

export interface ErrorHandler {
  handleError(error: EmulationError): void;
  attemptRecovery(error: EmulationError): boolean;
  logError(error: EmulationError): void;
}