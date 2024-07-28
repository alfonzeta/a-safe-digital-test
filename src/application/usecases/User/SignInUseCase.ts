import { UserRepository } from '../../../domain/UserRepository';
import { IJwtService } from '../../../domain/JwtRepository';

export class SignInUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: IJwtService
    ) { }

    public async execute(email: string, password: string): Promise<{ user: any, token: string } | null> {
        // Validate required fields
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
        console.log(email, password);


        const user = await this.userRepository.findByEmail(email);
        console.log("user2: ", user);

        if (!user || user.id === null) return null;

        const isPasswordValid = await this.userRepository.validatePassword(email, password);
        if (!isPasswordValid) return null;

        const token = this.jwtService.generateToken(user as { id: number, email: string, roleId: number, name: string });
        return { user, token };
    }
}
