import { promises as fs } from "fs";
import path from "path";
import { env } from "../config/env";

type KvRecordMap = Record<string, unknown>;

export class FileKvFallback {
    private readonly filePath = path.resolve(process.cwd(), env.localKvFilePath);

    private async readAll(): Promise<KvRecordMap> {
        try {
            const raw = await fs.readFile(this.filePath, "utf8");
            const parsed = JSON.parse(raw) as KvRecordMap;
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch (error: unknown) {
            if ((error as NodeJS.ErrnoException).code === "ENOENT") {
                return {};
            }
            throw error;
        }
    }

    async get<T>(key: string): Promise<T | null> {
        const all = await this.readAll();
        return key in all ? (all[key] as T) : null;
    }

    async put<T>(key: string, value: T): Promise<void> {
        const all = await this.readAll();
        all[key] = value;
        await fs.writeFile(this.filePath, JSON.stringify(all, null, 2));
    }
}