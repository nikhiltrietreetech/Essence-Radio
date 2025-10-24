import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { EpisodeModule } from './episode/episode.module';
import { WebrtcGateway } from './webrtc/webrtc.gateway';

@Module({
  imports: [PrismaModule,
    UserModule,
    EpisodeModule,
    WebrtcGateway
  ],
})
export class AppModule {}
