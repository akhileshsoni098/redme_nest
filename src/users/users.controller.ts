import { Controller, Get, Req, UseGuards } from "@nestjs/common";

import type { Request } from "express";
import { AuthGuard } from "../auth/auth.guard";
import { UsersService } from "./users.service";

@Controller('users')
export class UserController {
    constructor(private readonly userService:UsersService) {}

    @Get('profile')
    @UseGuards(AuthGuard)
    profile(@Req() req:Request) {
        console.log(req.user)
        return this.userService.profile(req.user!.id)
    }


}



