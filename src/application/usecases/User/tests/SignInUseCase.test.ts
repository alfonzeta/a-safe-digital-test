import { SignInUseCase } from '../SignInUseCase';
import { UserRepository } from '../../../../domain/UserRepository';
import { IJwtService } from '../../../../domain/JwtRepository';

describe('SignInUseCase', () => {
    let signInUseCase: SignInUseCase;
    let userRepository: UserRepository;
    let jwtService: IJwtService;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        userRepository = {
            findByEmail: jest.fn(),
            validatePassword: jest.fn(),
        } as unknown as UserRepository;
        jwtService = {
            generateToken: jest.fn(),
        } as unknown as IJwtService;
        signInUseCase = new SignInUseCase(userRepository, jwtService);
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore(); // Restore console.error after each test
    });

    it('should return user and token if the user is found and password is valid', async () => {
        const user = { id: 1, email: 'user@example.com', roleId: 2, name: 'User Name' };
        const token = 'valid-token';

        (userRepository.findByEmail as jest.Mock).mockResolvedValue(user); // Simulate user found
        (userRepository.validatePassword as jest.Mock).mockResolvedValue(true); // Simulate valid password
        (jwtService.generateToken as jest.Mock).mockReturnValue(token); // Simulate token generation

        const result = await signInUseCase.execute('user@example.com', 'password');
        expect(result).toEqual({ user, token });
        expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
        expect(userRepository.validatePassword).toHaveBeenCalledWith('user@example.com', 'password');
        expect(jwtService.generateToken).toHaveBeenCalledWith(user); // Verify token generation
    });

    it('should return null if the user is not found', async () => {
        (userRepository.findByEmail as jest.Mock).mockResolvedValue(null); // Simulate no user found

        const result = await signInUseCase.execute('user@example.com', 'password');
        expect(result).toBeNull();
        expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
        expect(userRepository.validatePassword).not.toHaveBeenCalled();
        expect(jwtService.generateToken).not.toHaveBeenCalled();
    });

    it('should return null if the password is invalid', async () => {
        const user = { id: 1, email: 'user@example.com', roleId: 2, name: 'User Name' };

        (userRepository.findByEmail as jest.Mock).mockResolvedValue(user); // Simulate user found
        (userRepository.validatePassword as jest.Mock).mockResolvedValue(false); // Simulate invalid password

        const result = await signInUseCase.execute('user@example.com', 'wrong-password');
        expect(result).toBeNull();
        expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
        expect(userRepository.validatePassword).toHaveBeenCalledWith('user@example.com', 'wrong-password');
        expect(jwtService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw an error if email is missing', async () => {
        await expect(signInUseCase.execute('', 'password'))
            .rejects
            .toThrow('Email and password are required');

        expect(userRepository.findByEmail).not.toHaveBeenCalled();
        expect(userRepository.validatePassword).not.toHaveBeenCalled();
        expect(jwtService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw an error if password is missing', async () => {
        await expect(signInUseCase.execute('user@example.com', ''))
            .rejects
            .toThrow('Email and password are required');

        expect(userRepository.findByEmail).not.toHaveBeenCalled();
        expect(userRepository.validatePassword).not.toHaveBeenCalled();
        expect(jwtService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw an error if both email and password are missing', async () => {
        await expect(signInUseCase.execute('', ''))
            .rejects
            .toThrow('Email and password are required');

        expect(userRepository.findByEmail).not.toHaveBeenCalled();
        expect(userRepository.validatePassword).not.toHaveBeenCalled();
        expect(jwtService.generateToken).not.toHaveBeenCalled();
    });

});
