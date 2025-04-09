import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET_KEY: string | undefined = process.env.JWT_KEY;

export function generateToken(payload: JwtPayload): string {
    if (SECRET_KEY === undefined) {
        throw new Error("JWT_SECRET non présente dans les variables d'environnement");
    }
    return jwt.sign(payload, SECRET_KEY as string, { expiresIn: '100h' });
}

export function verifyToken(token: string): string | JwtPayload | null {
    if (SECRET_KEY === undefined) {
        throw new Error("JWT_SECRET non présente dans les variables d'environnement");
    }
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch {
        return null;
    }
}

export function getUserIdFromPayload(payloadJson: string): string | null {
    try {
        if (!payloadJson || typeof payloadJson !== 'string')
            return null;

        const payload = JSON.parse(payloadJson);
        return payload.id || null;
    } catch (error) {
        console.error('Erreur lors du parsing du payload JWT :', error);
        return null;
    }
}
