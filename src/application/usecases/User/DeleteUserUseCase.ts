import { UserRepository } from '../../../domain/UserRepository';

class DeleteUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    public async execute(userId: number): Promise<boolean> {
        try {
            await this.userRepository.delete(userId);
            return true;
        } catch (error) {
            if (error instanceof Error && error.message === 'User not found') {
                return false;
            } else {
                console.error('Error deleting user:', error);
                throw new Error('Internal Server Error');
            }
        }
    }
}

export { DeleteUserUseCase };
