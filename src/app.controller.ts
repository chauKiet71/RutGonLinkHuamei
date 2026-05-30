import { Controller, Get, Post, Body, Param, Res, NotFoundException, BadRequestException, Req, Next } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type { Request, Response, NextFunction } from 'express';

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
    // Xóa ký tự gạch chéo ở đầu và cuối nếu người dùng nhập thừa
    slug = slug.replace(/^\/+|\/+$/g, '');

    if (slug) {
      const slugRegex = /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/;

      if (!slugRegex.test(slug)) {
        throw new BadRequestException(
          'Slug chỉ được chứa chữ cái, chữ số, dấu gạch ngang (-), gạch dưới (_) và dấu gạch chéo (/) phân cách',
        );
      }

      if (slug.length > 100) {
        throw new BadRequestException('Slug không được vượt quá 100 ký tự');
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

  @Get('api/links')
  async getLinks() {
    return this.prisma.link.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Get('*')
  async redirectLink(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const slug = decodeURIComponent(req.path.substring(1)).replace(/^\/+|\/+$/g, '');

    if (!slug || slug.startsWith('api/') || slug.includes('.') || slug === 'favicon.ico') {
      return next();
    }

    console.log('Host:', req.hostname);
    console.log('Slug:', slug);

    const link = await this.prisma.link.findUnique({
      where: { slug },
    });

    if (!link) {
      throw new NotFoundException('Link không tồn tại');
    }

    await this.prisma.link.update({
      where: { slug },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    const userAgent = req.headers['user-agent'] || '';
    const isBot = /facebookexternalhit|twitterbot|linkedinbot|embedly|quora link preview|rogueim|tumblr|vkShare|w3c_validator|slackbot|redditbot|applebot|whatsapp|flipboard|bitlybot|gsa-crawler|zalo|telegrambot|discordbot|googlebot|bingbot|yandex|baiduspider/i.test(userAgent);

    if (isBot) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers.host;
      const absoluteThumbnailUrl = `${protocol}://${host}/thumbnail.png`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Tiếng Trung Huamei - Rút Gọn Link</title>
    <meta name="description" content="Huamei Link - Công cụ rút gọn liên kết nhanh chóng, dễ dàng và hoàn toàn miễn phí của Tiếng Trung Huamei.">
    
    <!-- Open Graph / Facebook / Zalo -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Tiếng Trung Huamei - Rút Gọn Link">
    <meta property="og:description" content="Huamei Link - Rút gọn liên kết nhanh chóng và dễ dàng. Chia sẻ tài liệu học tiếng Trung miễn phí.">
    <meta property="og:image" content="${absoluteThumbnailUrl}">
    <meta property="og:url" content="${protocol}://${host}/${link.slug}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="Tiếng Trung Huamei - Rút Gọn Link">
    <meta property="twitter:description" content="Huamei Link - Rút gọn liên kết nhanh chóng và dễ dàng. Chia sẻ tài liệu học tiếng Trung miễn phí.">
    <meta property="twitter:image" content="${absoluteThumbnailUrl}">

    <!-- Fallback redirect -->
    <meta http-equiv="refresh" content="0;url=${link.destination}">
    <script>window.location.href = "${link.destination}";</script>
</head>
<body>
    Đang chuyển hướng đến <a href="${link.destination}">${link.destination}</a>...
</body>
</html>`);
    }

    return res.redirect(302, link.destination);
  }
}