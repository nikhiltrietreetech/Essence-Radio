import { ApiProperty } from '@nestjs/swagger';

export class CreateEpisodeDto {
  @ApiProperty({ example: 'My First Episode', description: 'Title of the episode' })
  title: string;

  @ApiProperty({ example: 'This is the first episode description', description: 'Description of the episode' })
  description: string;

  @ApiProperty({ example: 'audio-12345.mp3', required: false, description: 'Uploaded audio file name' })
  audioFile?: string;
}
