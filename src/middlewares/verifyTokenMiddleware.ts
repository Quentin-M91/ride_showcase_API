import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/JWTUtils';
import jwt from 'jsonwebtoken';

dotenv.config();

const SECRET_KEY = process.env.JWT_KEY;

export interface AuthenticatedRequest extends Request {
    user?: any; // On ajoute `user` à `req`
}

export function verifyTokenMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    try {
        if (!SECRET_KEY) {
            throw new Error("SECRET_KEY non présente dans les variables d'environnement. Veuillez vous connecter.");
        }

        let token: string | undefined;

        // Check Authorization header (Bearer token)
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // Check token in cookies
        if (!token && req.headers.cookie) {
            const match = req.headers.cookie.match(/jwt=([^;]+)/);
            token = match ? match[1] : undefined;
        }

        // If no token found
        if (!token) {
        res.status(401).json({ message: "Accès refusé. Token manquant." });
        return;
        }

        console.log(token);

        // Verify token
        const decoded = jwt.verify(token,SECRET_KEY) as jwt.JwtPayload;

        if (!decoded) {
        res.status(403).json({ message: "Token invalide ou expiré." });
        return;
        }

        // Attach user payload to request for later use
        req.headers.payload = JSON.stringify(decoded);
        next();

    } catch (error: any) {
        console.error("Erreur d'authentification :", error);
        res.status(403).json({ message: "Accès refusé. Token invalide ou expiré." });
    }
}