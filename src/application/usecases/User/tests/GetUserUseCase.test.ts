import { GetUserUseCase } from '../GetUserUseCase';
import { UserRepository } from '../../../../domain/UserRepository';
import { User } from '../../../../domain/User';

describe('GetUserUseCase', () => {
    let getUserUseCase: GetUserUseCase;
    let userRepository: UserRepository;

    beforeEach(() => {
        userRepository = {
            findById: jest.fn(),
        } as unknown as UserRepository;
        getUserUseCase = new GetUserUseCase(userRepository);
    });

    it('should return a user successfully if the user exists', async () => {
        const user = new User(1, 'Admin User', 'admin@example.com', "$2b$10$d5TE7T51d4WAf8anjqwVpOdfgCk0hcrxiL8Jzuxrb6i52eYC73bSq", 1);
        (userRepository.findById as jest.Mock).mockResolvedValue(user);

        const result = await getUserUseCase.execute(1);
        expect(result).toEqual(user);
        expect(userRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return null if the user does not exist', async () => {
        (userRepository.findById as jest.Mock).mockResolvedValue(null);

        const result = await getUserUseCase.execute(2);
        expect(result).toBeNull();
        expect(userRepository.findById).toHaveBeenCalledWith(2);
    });

    it('should handle errors and return null', async () => {
        (userRepository.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

        const result = await getUserUseCase.execute(3);
        expect(result).toBeNull();
        expect(userRepository.findById).toHaveBeenCalledWith(3);
    });

});
