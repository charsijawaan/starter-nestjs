import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/db-config/db-config.service';
import { Request, Response } from 'express';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { FRONT_END_ORIGIN } from 'src/constants';
var md5 = require('md5');

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() body) {
    const firstName = body.firstName as string;
    const lastName = body.lastName as string;
    const brandName = body.brandName as string;
    const email = body.email as string;
    const password = body.password as string;

    const users = await this.prisma.users.findMany({
      where: {
        email: email,
      },
    });
    const brands = await this.prisma.brands.findMany({
      where: {
        email: email,
      },
    });
    if (users.length || brands.length) {
      throw new HttpException('Email already exists.', HttpStatus.CONFLICT);
    }

    const currentTime = Number((new Date().getTime() / 1000).toFixed(0));
    const hashedPassword = md5(password);
    const hash = md5(currentTime.toString() + password);
    if (!!brandName) {
      await this.prisma.brands.create({
        data: {
          deleteds: '',
          brname: brandName,
          fname: firstName,
          lname: lastName,
          last_update: currentTime,
          last_login: currentTime,
          reg_date: currentTime,
          pass: hashedPassword,
          email: email,
          hash: hash,
          cate: '----',
          web: '----',
          info: '----',
          tel: '----',
          opening: '----',
          address: '----',
          profile_img: `${brandName.toLowerCase()[0]}.jpg`,
          profile_poster: '----',
        },
      });
      return {
        message: 'success',
      };
    } else {
      await this.prisma.users.create({
        data: {
          deleteds: '',
          fname: firstName,
          lname: lastName,
          password: hashedPassword,
          email: email,
          joining_date: currentTime,
          info: '----',
          tel: '----',
          loc: '----',
          profile_pic: `${firstName.toLowerCase()[0]}.jpg`,
          poster: '----',
          likes: 0,
          country: '----',
          city: '----',
          hash: hash,
        },
      });
      return {
        message: 'success',
      };
    }
  }

  @Post('login')
  async login(@Body() body, @Res({ passthrough: true }) res: Response) {
    const email = body.email as string;
    const password = body.password as string;

    const brand = await this.prisma.brands.findFirst({
      where: {
        email: email,
      },
    });

    const user = await this.prisma.users.findFirst({
      where: {
        email: email,
      },
    });

    if (!user && !brand) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    if (brand) {
      const hashedPassword = md5(password);
      if (hashedPassword != brand.pass) {
        throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
      }
      const jwt = await this.jwtService.signAsync({
        id: brand.id,
        type: 'brand',
      });
      res.setHeader('Access-Control-Allow-Origin', FRONT_END_ORIGIN);
      res.cookie('accessToken', jwt, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
      return {
        message: 'success',
      };
    } else if (user) {
      const hashedPassword = md5(password);
      if (hashedPassword != user.password) {
        throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
      }
      const jwt = await this.jwtService.signAsync({
        id: user.id,
        type: 'user',
      });
      res.setHeader('Access-Control-Allow-Origin', FRONT_END_ORIGIN);
      res.cookie('accessToken', jwt, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
      return {
        message: 'success',
      };
    }
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async me(
    @Req()
    req: Request & {
      user: {
        id: number;
        type: 'brand' | 'user';
        iat: number;
        exp: number;
      };
    },
  ) {
    if (req.user.type === 'user') {
      return {
        ...(await this.prisma.users.findFirst({
          where: {
            id: req.user.id,
          },
        })),
        type: 'user',
      };
    } else {
      return {
        ...(await this.prisma.brands.findFirst({
          where: {
            id: req.user.id,
          },
        })),
        type: 'brand',
      };
    }
    return 'Private Route';
  }
}
