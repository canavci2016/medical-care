import { Controller, Get, Query, Session } from '@nestjs/common';

@Controller('admin/auth')
export class AdminAuthController {
  @Get('login-over-token')
  loginPage(
    @Session() session: Record<string, any>,
    @Query() query: { token: string },
  ) {
    if (query.token == 'ramp-sail-glare') {
      session.adminToken = query.token; // Store the token in the session for future authentication 
      // Here you would typically verify the token and log the admin in
      return { message: 'Admin logged in successfully', token: query.token };
    }
    return { message: 'Admin token is either missing or invalid' };
  }
}
