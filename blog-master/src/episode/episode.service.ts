import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';


@Injectable()
export class EpisodeService {
  private prisma = new PrismaClient();

  async create(dto: CreateEpisodeDto) {
    return this.prisma.episode.create({ data: dto });
  }

  async findAll() {
    return this.prisma.episode.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const episode = await this.prisma.episode.findUnique({ where: { id } });
    if (!episode) throw new NotFoundException('Episode not found');
    return episode;
  }

  async update(id: string, dto: UpdateEpisodeDto) {
    await this.findOne(id); // check existence
    return this.prisma.episode.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id); // check existence
    return this.prisma.episode.delete({ where: { id } });
  }
}
