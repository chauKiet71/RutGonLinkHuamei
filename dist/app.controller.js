"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
function generateRandomSlug(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
let AppController = class AppController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createLink(body, req) {
        const destination = body.destination ? body.destination.trim() : '';
        if (!destination) {
            throw new common_1.BadRequestException('Đường dẫn gốc là bắt buộc');
        }
        let url = destination;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        try {
            new URL(url);
        }
        catch {
            throw new common_1.BadRequestException('Đường dẫn gốc không hợp lệ');
        }
        let slug = body.slug ? body.slug.trim() : '';
        if (slug) {
            const slugRegex = /^[a-zA-Z0-9_-]+$/;
            if (!slugRegex.test(slug)) {
                throw new common_1.BadRequestException('Slug chỉ được chứa chữ cái, chữ số, dấu gạch ngang (-) và gạch dưới (_)');
            }
            if (slug.length > 30) {
                throw new common_1.BadRequestException('Slug không được vượt quá 30 ký tự');
            }
            const reservedSlugs = ['api', 'admin', 'login', 'dashboard'];
            if (reservedSlugs.includes(slug.toLowerCase())) {
                throw new common_1.BadRequestException('Slug này không được phép sử dụng');
            }
            const existing = await this.prisma.link.findUnique({
                where: { slug },
            });
            if (existing) {
                throw new common_1.BadRequestException('Slug này đã tồn tại, vui lòng chọn slug khác');
            }
        }
        else {
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
                throw new common_1.BadRequestException('Không thể tạo slug tự động lúc này, vui lòng thử lại');
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
    async redirectLink(slug, req, res) {
        console.log('Host:', req.hostname);
        console.log('Slug:', slug);
        const link = await this.prisma.link.findUnique({
            where: { slug },
        });
        if (!link) {
            throw new common_1.NotFoundException('Link không tồn tại');
        }
        return res.redirect(302, link.destination);
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Post)('api/links'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "createLink", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "redirectLink", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppController);
//# sourceMappingURL=app.controller.js.map