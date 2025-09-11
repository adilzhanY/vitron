interface NeonDbError {
  code: string;
  detail: string;
}

export function isNeonDbError(error: unknown): error is NeonDbError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'detail' in error
  );
}