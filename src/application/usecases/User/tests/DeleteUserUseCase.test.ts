import { DeleteUserUseCase } from '../DeleteUserUseCase';
import { UserRepository } from '../../../../domain/UserRepository';

describe('DeleteUserUseCase', () => {
    let deleteUserUseCase: DeleteUserUseCase;
    let userRepository: UserRepository;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        userRepository = {
            delete: jest.fn(),
        } as unknown as UserRepository;
        deleteUserUseCase = new DeleteUserUseCase(userRepository);
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore(); // Restore console.error after each test
    });

    it('should return true if the user is successfully deleted', async () => {
        (userRepository.delete as jest.Mock).mockResolvedValue(undefined); // Simulate successful deletion

        const result = await deleteUserUseCase.execute(1);
        expect(result).toBe(true);
        expect(userRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return false if the user is not found', async () => {
        (userRepository.delete as jest.Mock).mockRejectedValue(new Error('User not found')); // Simulate user not found error

        const result = await deleteUserUseCase.execute(1);
        expect(result).toBe(false);
        expect(userRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should log an error and throw an Internal Server Error if there is an unexpected error', async () => {
        const unexpectedError = new Error('Unexpected error');
        (userRepository.delete as jest.Mock).mockRejectedValue(unexpectedError); // Simulate unexpected error

        await expect(deleteUserUseCase.execute(1)).rejects.toThrow('Internal Server Error');
        expect(console.error).toHaveBeenCalledWith('Error deleting user:', unexpectedError);
    });

    it('should return null and log an error for invalid userId formats', async () => {
        const invalidUserIds: any[] = [
            'invalid',  // Non-numeric string
            -1,         // Negative number
            1.5         // Float number
        ];

        for (const invalidUserId of invalidUserIds) {
            const result = await deleteUserUseCase.execute(invalidUserId);

            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith('Invalid ID format:', invalidUserId);
            expect(userRepository.delete).not.toHaveBeenCalled();
        }
    });
});
