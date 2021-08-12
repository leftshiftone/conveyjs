/**
 * Contract that all language provider must implement
 */
export interface LanguageProvider {
  get(): string | undefined;
}
