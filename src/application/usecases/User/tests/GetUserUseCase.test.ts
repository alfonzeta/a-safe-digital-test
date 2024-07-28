import { GetUserUseCase } from '../GetUserUseCase';
import { UserRepository } from '../../../../domain/UserRepository';
import { User } from '../../../../domain/User';

describe('GetUserUseCase', () => {
    let getUserUseCase: GetUserUseCase;
    let userRepository: UserRepository;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        userRepository = {
            findById: jest.fn(),
        } as unknown as UserRepository;
        getUserUseCase = new GetUserUseCase(userRepository);
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore(); // Restore console.error after each test
    });

    it('should return a user successfully if the user exists', async () => {
        const user = new User(1, 'Admin User', 'admin@example.com', 1, "$2b$10$d5TE7T51d4WAf8anjqwVpOdfgCk0hcrxiL8Jzuxrb6i52eYC73bSq");
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

    it('should return null and log an error if the id does not match /^[0-9]+$/', async () => {
        const invalidIds = [-1, NaN, 1.23];

        for (const invalidId of invalidIds) {
            await getUserUseCase.execute(invalidId as any);
            expect(console.error).toHaveBeenCalledWith('Invalid ID format:', invalidId);
        }
    });



    it('should log an error if there is an exception thrown by the repository', async () => {
        const error = new Error('Repository error');
        (userRepository.findById as jest.Mock).mockRejectedValue(error);

        const result = await getUserUseCase.execute(1);
        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith('Error retrieving user:', error);
    });
});
