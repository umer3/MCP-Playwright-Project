// @ts-check

/**
 * Generates a unique email so registration tests can run independently
 * and in parallel without colliding on an existing account.
 */
export function uniqueEmail(prefix = 'qa.smoke') {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1000)}@example.com`;
}
