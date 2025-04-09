// Importing Joi for validation
import Joi from 'joi';

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': `L'email est requis.`,
        'string.email': `L'email doit être valide`,
    }),
    password: Joi.string().min(8).required()
});

// Définition du schéma de validation pour l'inscription
export const registerSchema = Joi.object({
    nom: Joi.string().min(2).max(30).required()
        .messages({
            'string.empty': 'Le nom est requis.',
            'string.min': 'Le nom doit contenir au moins 2 caractères.',
            'string.max': 'Le nom ne peut pas dépasser 30 caractères.'
        }),
    prenom: Joi.string().min(2).max(30).required()
        .messages({
            'string.empty': 'Le prénom est requis.',
            'string.min': 'Le prénom doit contenir au moins 3 caractères.',
            'string.max': 'Le prénom ne peut pas dépasser 30 caractères.'
        }),
    username: Joi.string().min(3).max(30).required()
        .messages({
            'string.empty': `Le nom d'utilisateur est requis.`,
            'string.min': `Le nom d'utilisateur doit contenir au moins 3 caractères.`,
            'string.max': `Le nom d'utilisateur ne peut pas dépasser 30 caractères.`
        }),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.[!@#$%^&])(?=.*\d)/) // Au moins un caractère spécial et un chiffre
        .required()
        .messages({
            'string.empty': 'Le mot de passe est requis.',
            'string.min': 'Le mot de passe doit contenir au moins 8 caractères.',
            'string.pattern.base': 'Le mot de passe doit contenir au moins un chiffre et un caractère spécial.'
        }),
    email: Joi.string().email().required()
        .messages({
            'string.empty': `L'email est requis.`,
            'string.email': `L'email doit être valide.`,
        }),
});