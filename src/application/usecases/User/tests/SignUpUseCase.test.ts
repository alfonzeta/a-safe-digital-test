import { SignUpUseCase } from '../SignUpUseCase';
import { UserRepository } from '../../../../domain/UserRepository';
import { User } from '../../../../domain/User';

describe('SignUpUseCase', () => {
    let signUpUseCase: SignUpUseCase;
    let userRepository: UserRepository;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        userRepository = {
            findByEmail: jest.fn(),
            create: jest.fn(),
        } as unknown as UserRepository;
        signUpUseCase = new SignUpUseCase(userRepository);
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore(); // Restore console.error after each test
    });

    it('should create and return a new user if email does not exist', async () => {
        const user = new User(null, 'John Doe', 'john@example.com', 2, 'password123');
        (userRepository.findByEmail as jest.Mock).mockResolvedValue(null); // Simulate no existing user
        (userRepository.create as jest.Mock).mockResolvedValue(user); // Simulate user creation

        const result = await signUpUseCase.execute('John Doe', 'john@example.com', 'password123');
        expect(result).toEqual(user);
        expect(userRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
        expect(userRepository.create).toHaveBeenCalledWith(user);
    });

    it('should throw an error if email already exists', async () => {
        const existingUser = new User(1, 'Jane Doe', 'john@example.com', 2, 'password123');
        (userRepository.findByEmail as jest.Mock).mockResolvedValue(existingUser); // Simulate existing user

        await expect(signUpUseCase.execute('John Doe', 'john@example.com', 'password123'))
            .rejects
            .toThrow('Email already exists');

        expect(userRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
        expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if required fields are missing', async () => {
        const cases = [
            { name: 'John Doe', email: '', password: 'password123' },
            { name: '', email: 'john@example.com', password: 'password123' },
            { name: 'John Doe', email: 'john@example.com', password: '' },
            { name: '', email: '', password: '' },
        ];

        for (const { name, email, password } of cases) {
            await expect(signUpUseCase.execute(name, email, password))
                .rejects
                .toThrow('Missing required fields');
        }
    });

    it('should handle and log errors appropriately', async () => {
        const error = new Error('Unexpected error');
        (userRepository.findByEmail as jest.Mock).mockRejectedValue(error); // Simulate unexpected error

        await expect(signUpUseCase.execute('John Doe', 'john@example.com', 'password123'))
            .rejects
            .toThrow('Internal Server Error'); // Ensure internal server error is thrown

        expect(console.error).toHaveBeenCalledWith('Error updating user:', error); // Check if error was logged
    });
});
