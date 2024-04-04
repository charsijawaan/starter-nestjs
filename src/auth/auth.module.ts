import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      secret: 'secret',
      signOptions: {
        expiresIn: '365d',
      },
    }),
  ],
})
export class AuthModule {}
