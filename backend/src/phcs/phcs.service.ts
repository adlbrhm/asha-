import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePhcDto } from './dto/create-phc.dto';
import { UpdatePhcDto } from './dto/update-phc.dto';

@Injectable()
export class PhcsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pHC.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const phc = await this.prisma.pHC.findUnique({
      where: { id },
    });

    if (!phc) {
      throw new NotFoundException('PHC not found');
    }

    return phc;
  }

  async create(createPhcDto: CreatePhcDto) {
    return this.prisma.pHC.create({
      data: {
        name: createPhcDto.name,
        district: createPhcDto.district,
        state: createPhcDto.state,
        active: createPhcDto.active !== undefined ? createPhcDto.active : true,
      },
    });
  }

  async update(id: string, updatePhcDto: UpdatePhcDto) {
    const phc = await this.prisma.pHC.findUnique({
      where: { id },
    });

    if (!phc) {
      throw new NotFoundException('PHC not found');
    }

    return this.prisma.pHC.update({
      where: { id },
      data: updatePhcDto,
    });
  }
}
