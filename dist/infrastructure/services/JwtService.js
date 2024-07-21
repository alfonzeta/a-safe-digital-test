"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtService {
    constructor() {
        this.secret = process.env.JWT_SECRET || 'your-secret-key';
        this.expiresIn = '1h'; // Token expiration time
    }
    generateToken(user) {
        const payload = { id: user.id, email: user.email, roleId: user.roleId, name: user.name };
        return jsonwebtoken_1.default.sign(payload, this.secret, { expiresIn: this.expiresIn });
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.secret);
        }
        catch (err) {
            throw new Error('Invalid token');
        }
    }
}
exports.JwtService = JwtService;
