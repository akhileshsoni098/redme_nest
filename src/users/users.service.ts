import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DatabaseService } from '../db/database.service';
import { users } from './schema';
import { eq } from 'drizzle-orm';

import bcrypt from 'bcrypt'


@Injectable()
export class UsersService {
    constructor(private readonly database: DatabaseService) { }
     
    async create(dto: CreateUserDto) {
        try {
            // email duplicate check
            const [existing] = await this.database.db
                .select()
                .from(users)
                .where(eq(users.email, dto.email))
                .limit(1);

            if (existing) {
                throw new ConflictException('Email already exists');
            }
            // pass hash 
            const hashedPassword = await bcrypt.hash(dto.password, 10)

            const [created] = await this.database.db
                .insert(users)
                .values({
                    fname: dto.fname,
                    lname: dto.lname,
                    email: dto.email,
                    password: hashedPassword,
                    role: dto.role,
                })
                .returning()
            return created
        }
        catch (error: unknown) {
            if (error instanceof ConflictException || error instanceof NotFoundException) {
                throw error
            }
            throw new InternalServerErrorException('Failed to create user')
        }

    }
}

