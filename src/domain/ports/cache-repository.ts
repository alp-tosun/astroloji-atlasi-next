export interface ICacheRepository {
  get(collection: string, key: string): Promise<string | null>;
  set(collection: string, key: string, data: Record<string, unknown>): Promise<void>;
}
