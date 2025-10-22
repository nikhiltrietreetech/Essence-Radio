import { Controller, Get, Post, Put, Delete, Param, Body, UploadedFile, UseInterceptors } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { EpisodeService } from './episode.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';


@ApiTags('episodes')
@Controller('episodes')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Create a new episode' })
  @ApiBody({ type: CreateEpisodeDto })
  @ApiResponse({ status: 201, })
 async create(@Body() body: CreateEpisodeDto, @UploadedFile() file: any) {
  if (file) body.audioFile = file.filename;
  return this.episodeService.create(body);
}


  @Get()
  @ApiOperation({ summary: 'Get all episodes' })
  @ApiResponse({ status: 200, })
  async findAll() {
    return this.episodeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single episode by ID' })
  @ApiResponse({ status: 200,  })
  async findOne(@Param('id') id: string) {
    return this.episodeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an episode' })
  @ApiBody({ type: UpdateEpisodeDto })
  @ApiResponse({ status: 200, })
  async update(@Param('id') id: string, @Body() dto: UpdateEpisodeDto) {
    return this.episodeService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an episode' })
  @ApiResponse({ status: 200, description: 'Episode deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.episodeService.remove(id);
  }
}
