import { Controller, Get, Post, Body, Param, Res, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type { Response } from 'express';

function generateRandomSlug(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('api/links')
  async createLink(@Body() body: { slug?: string; destination: string }) {
    const destination = body.destination ? body.destination.trim() : '';
    if (!destination) {
      throw new BadRequestException('Đường dẫn gốc là bắt buộc');
    }

    let url = destination;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      new URL(url);
    } catch {
      throw new BadRequestException('Đường dẫn gốc không hợp lệ');
    }

    let slug = body.slug ? body.slug.trim() : '';

    if (slug) {
      const slugRegex = /^[a-zA-Z0-9_-]+$/;
      if (!slugRegex.test(slug)) {
        throw new BadRequestException('Slug chỉ được chứa chữ cái, chữ số, dấu gạch ngang (-) và gạch dưới (_)');
      }
      if (slug.length > 30) {
        throw new BadRequestException('Slug không được vượt quá 30 ký tự');
      }

      // Check if slug exists
      const existing = await this.prisma.link.findUnique({
        where: { slug }
      });

      if (existing) {
        throw new BadRequestException('Slug này đã tồn tại, vui lòng chọn slug khác');
      }
    } else {
      // Auto generate unique slug
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        slug = generateRandomSlug(6);
        const existing = await this.prisma.link.findUnique({
          where: { slug }
        });
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }
      if (!isUnique) {
        throw new BadRequestException('Không thể tạo slug tự động lúc này, vui lòng thử lại');
      }
    }

    const link = await this.prisma.link.create({
      data: {
        slug,
        destination: url
      }
    });

    return link;
  }

  @Get(':slug')
  async redirectLink(@Param('slug') slug: string, @Res() res: Response) {
    const link = await this.prisma.link.findUnique({
      where: { slug }
    });

    if (!link) {
      throw new NotFoundException('Link không tồn tại');
    }

    return res.redirect(302, link.destination);
  }
}
