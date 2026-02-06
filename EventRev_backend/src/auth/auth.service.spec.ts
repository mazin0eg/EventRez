/**
 * ============================================
 * AuthService Unit Tests
 * ============================================
 * 
 * Best Practices Applied:
 * 1. AAA Pattern (Arrange, Act, Assert)
 * 2. Descriptive test names using "should" convention
 * 3. Isolated tests with proper mocking
 * 4. Testing both success and error scenarios
 * 5. Grouping related tests with describe blocks
 * 6. Using beforeEach for common setup
 * 7.  edge casesTesting
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt module
jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  // ============================================
  // Mock Data - Centralized test fixtures
  // ============================================
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    role: Role.User,
    createdAt: new Date(),
  };

  const mockAdminUser = {
    id: 2,
    email: 'admin@example.com',
    password: '$2b$10$adminhashedpassword',
    role: Role.Admin,
    createdAt: new Date(),
  };

  const mockToken = 'mock.jwt.token';

  // ============================================
  // Test Setup
  // ============================================
  beforeEach(async () => {
    // Create mock implementations
    const mockUsersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  // ============================================
  // Service Initialization Tests
  // ============================================
  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(authService).toBeDefined();
    });

    it('should have UsersService injected', () => {
      expect(usersService).toBeDefined();
    });

    it('should have JwtService injected', () => {
      expect(jwtService).toBeDefined();
    });
  });

  // ============================================
  // Register Tests
  // ============================================
  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'SecurePass123!',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      const hashedPassword = '$2b$10$newhashedpassword';
      const newUser = {
        id: 3,
        email: registerDto.email,
        password: hashedPassword,
        role: Role.User,
        createdAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      usersService.create.mockResolvedValue(newUser);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith(
        registerDto.email,
        hashedPassword,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });
      expect(result).toEqual({ access_token: mockToken });
    });

    it('should hash the password with salt rounds of 10', async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      usersService.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      await authService.register(registerDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('should return JWT token after successful registration', async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      usersService.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(typeof result.access_token).toBe('string');
    });

    it('should propagate error when user creation fails', async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      usersService.create.mockRejectedValue(new Error('Email already exists'));

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should include user role in JWT payload', async () => {
      // Arrange
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      usersService.create.mockResolvedValue(mockAdminUser);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      await authService.register({ ...registerDto, email: 'admin@example.com' });

      // Assert
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.Admin }),
      );
    });
  });

  // ============================================
  // Login Tests
  // ============================================
  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'correctPassword',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result).toEqual({ access_token: mockToken });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should not expose whether email or password was wrong', async () => {
      // Arrange - User not found
      usersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      try {
        await authService.login(loginDto);
      } catch (error) {
        expect(error.message).toBe('Invalid credentials');
        // Message should be generic, not revealing if email exists
        expect(error.message).not.toContain('email');
        expect(error.message).not.toContain('user');
      }
    });

    it('should return JWT with correct payload structure', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      await authService.login(loginDto);

      // Assert
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should work with admin users', async () => {
      // Arrange
      const adminLoginDto = { email: 'admin@example.com', password: 'adminPass' };
      usersService.findByEmail.mockResolvedValue(mockAdminUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await authService.login(adminLoginDto);

      // Assert
      expect(result).toEqual({ access_token: mockToken });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.Admin }),
      );
    });
  });

  // ============================================
  // Edge Cases & Security Tests
  // ============================================
  describe('Security Edge Cases', () => {
    it('should handle empty password in login gracefully', async () => {
      // Arrange
      const loginDto = { email: 'test@example.com', password: '' };
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle very long passwords', async () => {
      // Arrange
      const longPassword = 'a'.repeat(1000);
      const registerDto = { email: 'test@example.com', password: longPassword };
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      usersService.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(result).toHaveProperty('access_token');
    });

    it('should handle special characters in email', async () => {
      // Arrange
      const loginDto = { email: "test+special'char@example.com", password: 'pass' };
      usersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should not call bcrypt.compare if user is not found', async () => {
      // Arrange
      usersService.findByEmail.mockResolvedValue(null);

      // Act
      try {
        await authService.login({ email: 'notfound@example.com', password: 'pass' });
      } catch {
        // Expected error
      }

      // Assert - bcrypt.compare should not be called for security
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });
});