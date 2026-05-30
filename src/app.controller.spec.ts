import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';

describe('AppController', () => {
  let appController: AppController;

  const mockPrismaService = {
    link: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLink', () => {
    it('should throw BadRequestException if destination is missing', async () => {
      await expect(
        appController.createLink({ slug: 'test', destination: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if destination is invalid URL', async () => {
      await expect(
        appController.createLink({ slug: 'test', destination: 'invalid-url::' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if slug already exists', async () => {
      mockPrismaService.link.findUnique.mockResolvedValue({
        id: 1,
        slug: 'test',
        destination: 'https://google.com',
      });

      await expect(
        appController.createLink({ slug: 'test', destination: 'https://google.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if slug has invalid characters', async () => {
      await expect(
        appController.createLink({ slug: 'test space', destination: 'https://google.com' }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        appController.createLink({ slug: 'test$', destination: 'https://google.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if slug is too long', async () => {
      const longSlug = 'a'.repeat(31);
      await expect(
        appController.createLink({ slug: longSlug, destination: 'https://google.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should prepend https:// to destination if it lacks protocol', async () => {
      mockPrismaService.link.findUnique.mockResolvedValue(null);
      mockPrismaService.link.create.mockImplementation(({ data }) => Promise.resolve({ id: 1, ...data }));

      const result = await appController.createLink({
        slug: 'test',
        destination: 'google.com',
      });

      expect(result.destination).toBe('https://google.com');
      expect(mockPrismaService.link.create).toHaveBeenCalledWith({
        data: {
          slug: 'test',
          destination: 'https://google.com',
        },
      });
    });

    it('should create link with original destination if it has http protocol', async () => {
      mockPrismaService.link.findUnique.mockResolvedValue(null);
      mockPrismaService.link.create.mockImplementation(({ data }) => Promise.resolve({ id: 1, ...data }));

      const result = await appController.createLink({
        slug: 'test',
        destination: 'http://google.com',
      });

      expect(result.destination).toBe('http://google.com');
    });

    it('should auto-generate slug if slug is not provided', async () => {
      mockPrismaService.link.findUnique.mockResolvedValue(null);
      mockPrismaService.link.create.mockImplementation(({ data }) => Promise.resolve({ id: 1, ...data }));

      const result = await appController.createLink({
        destination: 'https://google.com',
      });

      expect(result.slug).toBeDefined();
      expect(result.slug.length).toBe(6);
      expect(mockPrismaService.link.create).toHaveBeenCalledWith({
        data: {
          slug: result.slug,
          destination: 'https://google.com',
        },
      });
    });
  });

  describe('redirectLink', () => {
    it('should throw NotFoundException if link does not exist', async () => {
      mockPrismaService.link.findUnique.mockResolvedValue(null);
      const res = {
        redirect: jest.fn(),
      } as unknown as Response;

      await expect(appController.redirectLink('non-existent', res)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should redirect 302 to destination if link exists', async () => {
      const mockLink = {
        id: 1,
        slug: 'test',
        destination: 'https://google.com',
      };
      mockPrismaService.link.findUnique.mockResolvedValue(mockLink);
      const res = {
        redirect: jest.fn(),
      } as unknown as Response;

      await appController.redirectLink('test', res);

      expect(res.redirect).toHaveBeenCalledWith(302, 'https://google.com');
    });
  });
});
