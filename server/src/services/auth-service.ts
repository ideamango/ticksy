import { StoredUser } from "../domain/storage";
import { generateUserId } from "../lib/id";
import { UserRepository } from "../repositories/user-repository";

export interface AuthResult {
    user: StoredUser;
    created: boolean;
}

export class AuthService {
    constructor(private readonly userRepository: UserRepository) { }

    async ensureUser(userId: string): Promise<StoredUser> {
        return this.userRepository.ensure(userId);
    }

    async getUser(userId: string): Promise<StoredUser | null> {
        return this.userRepository.getById(userId);
    }

    async login(preferredUserId?: string): Promise<AuthResult> {
        const requestedUserId = preferredUserId?.trim();
        const userId = requestedUserId || generateUserId();
        const existing = await this.userRepository.getById(userId);
        if (existing) {
            return { user: existing, created: false };
        }

        const user = await this.userRepository.ensure(userId);
        return { user, created: true };
    }
}