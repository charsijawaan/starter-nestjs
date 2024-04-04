import { Global, Module } from '@nestjs/common';
import { PrismaService } from './db-config.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DbConfigModule {}
