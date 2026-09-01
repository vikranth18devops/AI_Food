import { v4 as uuidv4 } from 'uuid';

export function generateCorrelationId(): string {
  return `corr_${uuidv4()}`;
}

export function generateRequestId(): string {
  return `req_${uuidv4()}`;
}
