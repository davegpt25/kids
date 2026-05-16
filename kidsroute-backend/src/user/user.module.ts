import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Child } from './child.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Child])],
  providers: [UserService],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
