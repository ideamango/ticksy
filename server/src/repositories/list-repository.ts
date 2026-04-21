import { StoredList } from "../domain/storage";
import { KvClient } from "../lib/kv-client";
import { normalizeStoredList, STORAGE_SCHEMA_VERSION } from "../lib/storage-normalizers";

export class ListRepository {
    constructor(private readonly kvClient: KvClient) { }

    async getById(listId: string): Promise<StoredList | null> {
        const rawList = await this.kvClient.get<unknown>(listId);
        const list = normalizeStoredList(rawList);

        if (list && JSON.stringify(rawList) !== JSON.stringify(list)) {
            await this.save(list);
        }

        return list;
    }

    async save(list: StoredList): Promise<void> {
        await this.kvClient.put(list.listId, {
            ...list,
            schemaVersion: STORAGE_SCHEMA_VERSION,
        });
    }
}
