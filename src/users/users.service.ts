import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DatabaseService } from '../db/database.service';
import { users } from './schema';
import { eq } from 'drizzle-orm';

import bcrypt from 'bcrypt'


@Injectable()
export class UsersService {
    constructor(private readonly database: DatabaseService) { }
//
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

    async findByEmail(email: string) {
        try {
            const [user] = await this.database.db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1)
            return user ?? null
        } catch (error: unknown) {
            throw new InternalServerErrorException('Failed to find user by email')
        }

    }

    async validatePassword(plainPassword: string, hashedPassword: string) {
        try {
            return bcrypt.compare(plainPassword, hashedPassword)
        } catch {
            throw new InternalServerErrorException('Failed to validate password')
        }
    }

    async findOne(id: number) {
        try {
            const [user] = await this.database.db
                .select()
                .from(users)
                .where(eq(users.id, id))
                .limit(1)

            if (!user) {
                throw new NotFoundException(`User with id ${id} not found`)
            }

            return user
        } catch (error: unknown) {
            if (error instanceof NotFoundException) {
                throw error
            }
            throw new InternalServerErrorException('Failed to find user')
        }
    }

    async profile(userId: number) {
        const user = await this.findOne(userId)
        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword
    }

}







