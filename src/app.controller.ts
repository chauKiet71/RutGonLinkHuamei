import { Controller, Get, Post, Body, Param, Res, NotFoundException, BadRequestException, Req } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type { Request, Response } from 'express';

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
  constructor(private readonly prisma: PrismaService) { }

  @Post('api/links')
  async createLink(
    @Body() body: { slug?: string; destination: string },
    @Req() req: Request,
  ) {
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
        throw new BadRequestException(
          'Slug chỉ được chứa chữ cái, chữ số, dấu gạch ngang (-) và gạch dưới (_)',
        );
      }

      if (slug.length > 30) {
        throw new BadRequestException('Slug không được vượt quá 30 ký tự');
      }

      const reservedSlugs = ['api', 'admin', 'login', 'dashboard'];

      if (reservedSlugs.includes(slug.toLowerCase())) {
        throw new BadRequestException('Slug này không được phép sử dụng');
      }

      const existing = await this.prisma.link.findUnique({
        where: { slug },
      });

      if (existing) {
        throw new BadRequestException(
          'Slug này đã tồn tại, vui lòng chọn slug khác',
        );
      }
    } else {
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        slug = generateRandomSlug(6);

        const existing = await this.prisma.link.findUnique({
          where: { slug },
        });

        if (!existing) {
          isUnique = true;
        }

        attempts++;
      }

      if (!isUnique) {
        throw new BadRequestException(
          'Không thể tạo slug tự động lúc này, vui lòng thử lại',
        );
      }
    }

    const link = await this.prisma.link.create({
      data: {
        slug,
        destination: url,
      },
    });

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers.host;

    return {
      id: link.id,
      slug: link.slug,
      destination: link.destination,
      shortUrl: `${protocol}://${host}/${link.slug}`,
      createdAt: link.createdAt,
    };
  }

  @Get(':slug')
  async redirectLink(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log('Host:', req.hostname);
    console.log('Slug:', slug);

    const link = await this.prisma.link.findUnique({
      where: { slug },
    });

    if (!link) {
      throw new NotFoundException('Link không tồn tại');
    }

    return res.redirect(302, link.destination);
  }
}