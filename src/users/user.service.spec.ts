import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      const mockUserData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockSalt = 'mock-salt';
      const mockHash = 'hashed-password';

      const mockUser: User = {
        id: '1',
        name: mockUserData.name,
        email: mockUserData.email,
        passwordHash: mockHash,
      };

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.createUser(
        mockUserData.name,
        mockUserData.email,
        mockUserData.password,
      );

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, mockSalt);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: mockUserData.name,
        email: mockUserData.email,
        passwordHash: mockHash,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should handle password hashing errors', async () => {
      const mockUserData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new Error('Hashing failed');
      (bcrypt.genSalt as jest.Mock).mockRejectedValue(error);

      await expect(
        service.createUser(mockUserData.name, mockUserData.email, mockUserData.password),
      ).rejects.toThrow('Hashing failed');

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const mockUser: User = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('1');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent-id');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
      expect(result).toBeNull();
    });
  });
}); 