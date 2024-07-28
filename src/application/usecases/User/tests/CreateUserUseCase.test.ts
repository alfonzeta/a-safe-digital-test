import { CreateUserUseCase } from '../CreateUserUseCase';
import { UserRepository } from '../../../../domain/UserRepository';
import { User } from '../../../../domain/User';

describe('CreateUserUseCase', () => {
    let createUserUseCase: CreateUserUseCase;
    let userRepository: UserRepository;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        userRepository = {
            findByEmail: jest.fn(),
            create: jest.fn(),
        } as unknown as UserRepository;
        createUserUseCase = new CreateUserUseCase(userRepository);
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore(); // Restore console.error after each test
    });

    it('should create and return a user successfully if no user with the email exists', async () => {
        const user = new User(1, 'User Name', 'user@example.com', 2, 'hashedpassword');
        (userRepository.findByEmail as jest.Mock).mockResolvedValue(null); // No user with the given email
        (userRepository.create as jest.Mock).mockResolvedValue(user); // Successfully created user

        const result = await createUserUseCase.execute('User Name', 'user@example.com', 'hashedpassword', 2);
        expect(result).toEqual(user);
        expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
        expect(userRepository.create).toHaveBeenCalledWith(expect.any(User));
    });

    it('should return null if a user with the email already exists', async () => {
        const existingUser = new User(1, 'Existing User', 'user@example.com', 2, 'hashedpassword');
        (userRepository.findByEmail as jest.Mock).mockResolvedValue(existingUser); // User already exists

        const result = await createUserUseCase.execute('User Name', 'user@example.com', 'hashedpassword', 2);
        expect(result).toBeNull();
        expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
        expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should log an error and return null if there is an exception during user creation', async () => {
        const error = new Error('Database error');
        (userRepository.findByEmail as jest.Mock).mockResolvedValue(null); // No user with the given email
        (userRepository.create as jest.Mock).mockRejectedValue(error); // Simulate error during user creation

        const result = await createUserUseCase.execute('User Name', 'user@example.com', 'hashedpassword', 2);
        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith('Error creating user:', error);
    });
});
