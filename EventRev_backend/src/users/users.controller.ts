import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string; role: string };
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current user (without password).',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  async me(@Req() req: AuthenticatedRequest) {
    const userId = req?.user?.userId;
    if (!userId) return null;
    const user = await this.usersService.findById(userId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = user;
    return safe;
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin-only endpoint' })
  @ApiResponse({ status: 200, description: 'Admin access granted.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing token.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires admin role.' })
  adminOnly() {
    return { ok: true, message: 'Admin access granted' };
  }
}
