import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { role?: string; status?: string; search?: string }) {
    const where: any = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        village: true,
        status: true,
        phcId: true,
        phc: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { phc: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phcId: user.phcId,
      phcName: user.phc?.name || null,
      village: user.village,
      status: user.status,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, role, password, village, phcId, status } = createUserDto as any;

    if (role === 'ADMIN') {
      throw new ForbiddenException('Cannot create ADMIN users via API');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let resolvedPhcId: string | null = null;
    if (phcId) {
      const phcById = await this.prisma.pHC.findUnique({ where: { id: phcId } });
      if (phcById) {
        resolvedPhcId = phcById.id;
      } else {
        const phcByName = await this.prisma.pHC.findFirst({
          where: { name: { contains: phcId } },
        });
        if (phcByName) {
          resolvedPhcId = phcByName.id;
        }
      }
    }

    return this.prisma.user.create({
      data: {
        name,
        email,
        role,
        passwordHash,
        village: village || null,
        phcId: resolvedPhcId,
        status: status || 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        village: true,
        status: true,
        phcId: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot update ADMIN users');
    }

    const data: any = { ...updateUserDto };
    
    if (data.role === 'ADMIN') {
      throw new ForbiddenException('Cannot assign ADMIN role');
    }

    if (data.password) {
      delete data.password;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        village: true,
        status: true,
        phcId: true,
        updatedAt: true,
      },
    });
  }
  
  async updatePassword(id: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot update password of ADMIN users');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot change status of ADMIN users');
    }

    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot delete ADMIN users');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
