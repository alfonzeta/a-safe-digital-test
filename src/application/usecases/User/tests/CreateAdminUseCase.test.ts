import { CreateAdminUseCase } from '../CreateAdminUseCase';
import { UserRepository } from '../../../../domain/UserRepository';
import { User } from '../../../../domain/User';

describe('CreateAdminUseCase', () => {
    let createAdminUseCase: CreateAdminUseCase;
    let userRepository: UserRepository;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        userRepository = {
            findByEmail: jest.fn(),
            create: jest.fn(),
        } as unknown as UserRepository;
        createAdminUseCase = new CreateAdminUseCase(userRepository);
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore(); // Restore console.error after each test
    });

    it('should create and return a user successfully if no user with the email exists', async () => {
        const user = new User(1, 'Admin User', 'admin@example.com', 1, 'hashedpassword');
        (userRepository.findByEmail as jest.Mock).mockResolvedValue(null); // No user with the given email
        (userRepository.create as jest.Mock).mockResolvedValue(user); // Successfully created user

        const result = await createAdminUseCase.execute('Admin User', 'admin@example.com', 'hashedpassword');
        expect(result).toEqual(user);
        expect(userRepository.findByEmail).toHaveBeenCalledWith('admin@example.com');
        expect(userRepository.create).toHaveBeenCalledWith(expect.any(User));
    });

    it('should return null if a user with the email already exists', async () => {
        const existingUser = new User(1, 'Existing User', 'admin@example.com', 1, 'hashedpassword');
        (userRepository.findByEmail as jest.Mock).mockResolvedValue(existingUser); // User already exists

        const result = await createAdminUseCase.execute('Admin User', 'admin@example.com', 'hashedpassword');
        expect(result).toBeNull();
        expect(userRepository.findByEmail).toHaveBeenCalledWith('admin@example.com');
        expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should log an error and return null if there is an exception during user creation', async () => {
        const error = new Error('Database error');
        (userRepository.findByEmail as jest.Mock).mockResolvedValue(null); // No user with the given email
        (userRepository.create as jest.Mock).mockRejectedValue(error); // Simulate error during user creation

        const result = await createAdminUseCase.execute('Admin User', 'admin@example.com', 'hashedpassword');
        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith('Error creating user:', error);
    });
});
