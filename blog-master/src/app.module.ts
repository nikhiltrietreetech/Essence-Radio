import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { EpisodeModule } from './episode/episode.module';

@Module({
  imports: [PrismaModule,
    UserModule,
    EpisodeModule
  ],
})
export class AppModule {}
