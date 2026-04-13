import { StoredList } from "../domain/storage";
import { KvClient } from "../lib/kv-client";

export class ListRepository {
    constructor(private readonly kvClient: KvClient) { }

    async getById(listId: string): Promise<StoredList | null> {
        return this.kvClient.get<StoredList>(listId);
    }

    async save(list: StoredList): Promise<void> {
        await this.kvClient.put(list.listId, list);
    }
}
