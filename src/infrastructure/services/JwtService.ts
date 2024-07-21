import jwt from 'jsonwebtoken';

export class JwtService {
    private readonly secret: string;
    private readonly expiresIn: string;

    constructor() {
        this.secret = process.env.JWT_SECRET || 'your-secret-key';
        this.expiresIn = '1h'; // Token expiration time
    }

    public generateToken(user: { id: number, email: string, roleId: number, name: string }): string {

        const payload = { id: user.id, email: user.email, roleId: user.roleId, name: user.name };
        return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
    }

    public verifyToken(token: string): any {
        try {
            return jwt.verify(token, this.secret);
        } catch (err) {
            throw new Error('Invalid token');
        }
    }
}
