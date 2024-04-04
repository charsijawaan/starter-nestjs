import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { DbConfigModule } from './db-config/db-config.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, DbConfigModule, AuthModule],
  controllers: [AppController],
})
export class AppModule {}
