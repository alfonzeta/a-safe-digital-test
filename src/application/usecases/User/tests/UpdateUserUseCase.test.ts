import { UpdateUserUseCase } from '../UpdateUserUseCase';
import { UserRepository } from '../../../../domain/UserRepository';
import { User } from '../../../../domain/User';

describe('UpdateUserUseCase', () => {
    let updateUserUseCase: UpdateUserUseCase;
    let userRepository: UserRepository;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        userRepository = {
            findById: jest.fn(),
            update: jest.fn(),
        } as unknown as UserRepository;
        updateUserUseCase = new UpdateUserUseCase(userRepository);
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore(); // Restore console.error after each test
    });

    it('should update and return user if the user exists', async () => {
        const existingUser = new User(1, 'Old Name', 'old@example.com', 2, 'oldpassword');
        const updatedUser = new User(1, 'New Name', 'new@example.com', 3, 'newpassword');

        (userRepository.findById as jest.Mock).mockResolvedValue(existingUser); // Simulate user found
        (userRepository.update as jest.Mock).mockResolvedValue(updatedUser); // Simulate user update

        const result = await updateUserUseCase.execute(1, 'New Name', 'new@example.com', 'newpassword', 3);
        expect(result).toEqual(updatedUser);
        expect(userRepository.findById).toHaveBeenCalledWith(1);
        expect(userRepository.update).toHaveBeenCalledWith(expect.objectContaining({
            name: 'New Name',
            email: 'new@example.com',
            password: 'newpassword',
            roleId: 3,
        }));
    });

    it('should update and return user with updated name', async () => {
        const existingUser = new User(1, 'Old Name', 'old@example.com', 2, 'password123');
        const updatedUser = new User(1, 'New Name', 'old@example.com', 2, 'password123');

        (userRepository.findById as jest.Mock).mockResolvedValue(existingUser); // Simulate user found
        (userRepository.update as jest.Mock).mockResolvedValue(updatedUser); // Simulate user update

        const result = await updateUserUseCase.execute(1, 'New Name', 'old@example.com', 'password123', 2);
        expect(result).toEqual(updatedUser);
        expect(userRepository.update).toHaveBeenCalledWith(expect.objectContaining({
            name: 'New Name',
        }));
    });

    it('should return null and log an error for invalid userId formats', async () => {
        const invalidUserIds: any[] = [
            'invalid',  // Non-numeric string
            -1,         // Negative number
            1.5         // Float number
        ];

        for (const invalidUserId of invalidUserIds) {
            const result = await updateUserUseCase.execute(invalidUserId, 'New Name', 'new@example.com', 'newpassword', 3);

            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith('Invalid ID format:', invalidUserId);
            expect(userRepository.findById).not.toHaveBeenCalled();
            expect(userRepository.update).not.toHaveBeenCalled();
        }
    });


    it('should update and return user with updated email', async () => {
        const existingUser = new User(1, 'Old Name', 'old@example.com', 2, 'password123');
        const updatedUser = new User(1, 'Old Name', 'new@example.com', 2, 'password123');

        (userRepository.findById as jest.Mock).mockResolvedValue(existingUser); // Simulate user found
        (userRepository.update as jest.Mock).mockResolvedValue(updatedUser); // Simulate user update

        const result = await updateUserUseCase.execute(1, 'Old Name', 'new@example.com', 'password123', 2);
        expect(result).toEqual(updatedUser);
        expect(userRepository.update).toHaveBeenCalledWith(expect.objectContaining({
            email: 'new@example.com',
        }));
    });

    it('should update and return user with updated password', async () => {
        const existingUser = new User(1, 'Old Name', 'old@example.com', 2, 'oldpassword');
        const updatedUser = new User(1, 'Old Name', 'old@example.com', 2, 'newpassword');

        (userRepository.findById as jest.Mock).mockResolvedValue(existingUser); // Simulate user found
        (userRepository.update as jest.Mock).mockResolvedValue(updatedUser); // Simulate user update

        const result = await updateUserUseCase.execute(1, 'Old Name', 'old@example.com', 'newpassword', 2);
        expect(result).toEqual(updatedUser);
        expect(userRepository.update).toHaveBeenCalledWith(expect.objectContaining({
            password: 'newpassword',
        }));
    });

    it('should update and return user with updated roleId', async () => {
        const existingUser = new User(1, 'Old Name', 'old@example.com', 2, 'password123',);
        const updatedUser = new User(1, 'Old Name', 'old@example.com', 3, 'password123');

        (userRepository.findById as jest.Mock).mockResolvedValue(existingUser); // Simulate user found
        (userRepository.update as jest.Mock).mockResolvedValue(updatedUser); // Simulate user update

        const result = await updateUserUseCase.execute(1, 'Old Name', 'old@example.com', 'password123', 3);
        expect(result).toEqual(updatedUser);
        expect(userRepository.update).toHaveBeenCalledWith(expect.objectContaining({
            roleId: 3,
        }));
    });


    it('should return null if the user does not exist', async () => {
        (userRepository.findById as jest.Mock).mockResolvedValue(null); // Simulate no user found

        const result = await updateUserUseCase.execute(1, 'New Name', 'new@example.com', 'newpassword', 3);
        expect(result).toBeNull();
        expect(userRepository.findById).toHaveBeenCalledWith(1);
        expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if the email already exists', async () => {
        const existingUser = new User(1, 'Old Name', 'old@example.com', 2, 'oldpassword');
        (userRepository.findById as jest.Mock).mockResolvedValue(existingUser); // Simulate user found

        // Simulate an error indicating the email already exists
        const error = new Error('Email already exists');
        (userRepository.update as jest.Mock).mockRejectedValue(error);

        await expect(updateUserUseCase.execute(1, 'New Name', 'new@example.com', 'newpassword', 3))
            .rejects
            .toThrow('Email already exists');

        expect(userRepository.findById).toHaveBeenCalledWith(1);
        expect(userRepository.update).toHaveBeenCalledWith(expect.objectContaining({
            name: 'New Name',
            email: 'new@example.com',
            password: 'newpassword',
            roleId: 3,
        }));
    });

    it('should handle and log errors appropriately', async () => {
        const error = new Error('Unexpected error');
        (userRepository.findById as jest.Mock).mockRejectedValue(error); // Simulate unexpected error

        await expect(updateUserUseCase.execute(1, 'New Name', 'new@example.com', 'newpassword', 3))
            .rejects
            .toThrow('Internal Server Error'); // Ensure internal server error is thrown

        expect(console.error).toHaveBeenCalledWith('Error updating user:', error); // Check if error was logged
    });
});
