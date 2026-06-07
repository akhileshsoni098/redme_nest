import { Injectable, UnauthorizedException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    // register service 

    async register(dto: RegisterDto) {
        try {
            const createUserDto = new CreateUserDto()
            createUserDto.fname = dto.fname
            createUserDto.lname = dto.lname
            createUserDto.email = dto.email
            createUserDto.password = dto.password
            createUserDto.role = dto.role

            const user = await this.usersService.create(createUserDto)

            console.log(user)

            const token = this.jwtService.sign({ id: user.id })

            const { password, ...result } = user

            return { user: result, token }

        } catch (error: unknown) {

            // console.log(error);
            if (error instanceof ConflictException) {
                throw error; // preserve 409
            }
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Login failed');
        }



    }

    // Login service 

    async login(dto: LoginDto) {
        try {

            const user = await this.usersService.findByEmail(dto.email)
            if (!user) {
                throw new UnauthorizedException('Invalid credentials');
            }

            const isPasswordValid = await this.usersService.validatePassword(
                dto.password,
                user.password
            )

            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }

            const token = this.jwtService.sign({ id: user.id })

            const { password, ...result } = user
            return { user: result, token }

        } catch (error: unknown) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Login failed');
        }
    }

}