import { Module  } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ResourceModule } from './resource/resource.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CourseModule } from './course/course.module';
import { SectionModule } from './section/section.module';
import { VideoModule } from './video/video.module';
import { WorkerModule } from './worker/worker.module';
import { BullModule } from '@nestjs/bull';
import path from 'node:path';
import { RedisService } from './redis/redis.service';
import { CommentModule } from './comment/comment.module';


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true, // يبقى متاح لكل modules
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: parseInt(process.env.DB_PORT ?? '3306', 10),
      username: process.env.DB_USERNAME ?? 'root',
      password: process.env.DB_PASSWORD ?? '27112000',
      database: process.env.DB_NAME ?? 'default_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    ResourceModule,
    CourseModule,
    SectionModule,
    VideoModule,
    WorkerModule,
    BullModule.forRoot({
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService, RedisService],
})
export class AppModule {}
