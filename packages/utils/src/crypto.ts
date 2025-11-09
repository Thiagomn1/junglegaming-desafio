import * as bcrypt from 'bcrypt';

const DEFAULT_SALT_ROUNDS = 10;

/**
 * Gera um hash bcrypt de uma string (normalmente senha)
 * @param value - String a ser hasheada
 * @param saltRounds - Número de rounds do salt (padrão: 10)
 * @returns Promise com o hash gerado
 */
export const hashPassword = async (
  value: string,
  saltRounds: number = DEFAULT_SALT_ROUNDS,
): Promise<string> => {
  return bcrypt.hash(value, saltRounds);
};

/**
 * Compara uma string com um hash bcrypt
 * @param value - String em texto plano
 * @param hash - Hash bcrypt para comparar
 * @returns Promise com boolean indicando se coincidem
 */
export const comparePassword = async (
  value: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(value, hash);
};
