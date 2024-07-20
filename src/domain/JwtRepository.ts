export interface IJwtService {
    generateToken(user: { id: number, email: string, roleId: number }): string;
    verifyToken(token: string): any;
}
