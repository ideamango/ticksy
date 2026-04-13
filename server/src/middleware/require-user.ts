import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth-service";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export function createRequireUserMiddleware(authService: AuthService) {
    return async function requireUser(req: Request, res: Response, next: NextFunction) {
        const userId = req.headers["x-user-id"] as string | undefined;
        if (!userId) {
            res.status(401).json({ error: "Missing x-user-id header" });
            return;
        }

        try {
            await authService.ensureUser(userId);
            req.userId = userId;
            next();
        } catch (error) {
            next(error);
        }
    };
}