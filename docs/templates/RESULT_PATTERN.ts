// RESULT_PATTERN.ts
// Implementação mínima e pragmática de Result/Ok/Err + helpers
// (Adapte os nomes/paths para combinar com seu Core Kit.)

export type Ok<T> = {
  readonly isOk: true;
  readonly isErr: false;
  readonly value: T;
};

export type Err<E> = {
  readonly isOk: false;
  readonly isErr: true;
  readonly error: E;
};

export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { isOk: true, isErr: false, value };
}

export function err<E>(error: E): Err<E> {
  return { isOk: false, isErr: true, error };
}

// Helpers opcionais
export function map<T, E, U>(res: Result<T, E>, fn: (v: T) => U): Result<U, E> {
  return res.isOk ? ok(fn(res.value)) : res;
}

export async function mapAsync<T, E, U>(
  res: Result<T, E>,
  fn: (v: T) => Promise<U>
): Promise<Result<U, E>> {
  return res.isOk ? ok(await fn(res.value)) : res;
}

export function andThen<T, E, U>(res: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> {
  return res.isOk ? fn(res.value) : res;
}

export async function andThenAsync<T, E, U>(
  res: Result<T, E>,
  fn: (v: T) => Promise<Result<U, E>>
): Promise<Result<U, E>> {
  return res.isOk ? await fn(res.value) : res;
}