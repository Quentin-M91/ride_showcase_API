// import dotenv from 'dotenv';
// import { Request, Response, NextFunction } from 'express';
// import { verifyToken } from '../utils/JWTUtils';

// dotenv.config();

// const SECRET_KEY = process.env.JWT_KEY;

// export function verifyTokenMiddleware(req: Request, res: Response, next: NextFunction): void {
//     if (SECRET_KEY === undefined) {
//         throw new Error('SECRET KEY is not defined');
//     }
//     const cookie = req.headers.cookie;
//     if (!cookie) {
//         res.status(401).json({ message: 'Vous devez être connecté pour accéder à cette ressource' });
//         return;
//     }
//     const token = cookie.split('=')[1];
//     console.log(token);

//     if (!token) {
//         res.status(401).json({ message: 'Vous devez être connecté pour accéder à cette ressource' });
//         return;
//     }
//     try {
//         const decoded = verifyToken(token);
//         req.headers.user = JSON.stringify(decoded);
//         next();
//         if (!decoded) {
//             res.status(403).send({ message: 'Token Invalide ou Expiré' });
//         }

//     } catch (error) {
//         res.status(401).send({ message: 'Vous n\'êtes pas autorisé à accéder à cette ressource' });
//         return;
//     }
// }





import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/JWTUtils';
import Utilisateur from '../models/Utilisateur.model';

dotenv.config();

const SECRET_KEY = process.env.JWT_KEY;

export interface AuthenticatedRequest extends Request {
    user?: any; // On ajoute `user` à `req`
}

export async function verifyTokenMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (SECRET_KEY === undefined) {
        throw new Error('SECRET KEY is not defined');
    }
    const cookie = req.headers.cookie;
    if (!cookie) {
        res.status(401).json({ message: 'Vous devez être connecté pour accéder à cette ressource' });
        return;
    }
    const token = cookie.split('=')[1];
    console.log(token);

    if (!token) {
        res.status(401).json({ message: 'Vous devez être connecté pour accéder à cette ressource' });
        return;
    }
    try {
        const decoded:any = verifyToken(token);
        const utilisateur = await Utilisateur.findByPk(decoded.id);
        if (!utilisateur) {
            res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        req.user = utilisateur; // Attache l'utilisateur à `req.user`
        next();
    } catch (error) {
        res.status(401).send({ message: 'Vous n\'êtes pas autorisé à accéder à cette ressource' });
        return;
    }
}