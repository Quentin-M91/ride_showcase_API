// Importing Joi for validation
import Joi from 'joi'; 

export const loginSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email(),
    password: Joi.string().min(3).required()
});