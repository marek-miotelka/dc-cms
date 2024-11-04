import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminUsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/User.dto';
import { JwtAuthGuard } from '@api-server/auth/jwt/jwt.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SanitizedUser, UserModel } from './models/User.model';

/**
 * Controller handling user-related HTTP requests
 * All routes require JWT authentication
 */
@ApiTags('admin/users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  /**
   * Creates a new user
   * @param createUserDto - The user data to create
   * @returns Promise resolving to the created sanitized user
   */
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created',
    type: CreateUserDto,
  })
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<SanitizedUser> {
    const user = await this.usersService.createUser(createUserDto);
    return UserModel.sanitize(user);
  }

  /**
   * Retrieves all users
   * @returns Promise resolving to an array of sanitized users
   */
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [CreateUserDto],
  })
  @Get()
  async findAll(): Promise<SanitizedUser[]> {
    const users = await this.usersService.findAll();
    return users.map(UserModel.sanitize);
  }

  /**
   * Retrieves a specific user by documentId
   * @param documentId - The documentId of the user to retrieve
   * @returns Promise resolving to the found sanitized user
   * @throws NotFoundException if user is not found
   */
  @ApiOperation({ summary: 'Get user by documentId' })
  @ApiResponse({
    status: 200,
    description: 'The found user',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @Get(':documentId')
  async findOne(
    @Param('documentId') documentId: string,
  ): Promise<SanitizedUser> {
    const user = await this.usersService.findByDocumentId(documentId);
    return UserModel.sanitize(user);
  }

  /**
   * Updates an existing user
   * @param documentId - The documentId of the user to update
   * @param updateUserDto - The updated user data
   * @returns Promise resolving to the updated sanitized user
   * @throws NotFoundException if user is not found
   */
  @ApiOperation({ summary: 'Update user by documentId' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated',
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @Put(':documentId')
  async update(
    @Param('documentId') documentId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<SanitizedUser> {
    const user = await this.usersService.findByDocumentId(documentId);
    const updatedUser = await this.usersService.update(user.id, updateUserDto);
    return UserModel.sanitize(updatedUser);
  }

  /**
   * Deletes a user
   * @param documentId - The documentId of the user to delete
   * @throws NotFoundException if user is not found
   */
  @ApiOperation({ summary: 'Delete user by documentId' })
  @ApiResponse({
    status: 204,
    description: 'The user has been successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('documentId') documentId: string): Promise<void> {
    const user = await this.usersService.findByDocumentId(documentId);
    await this.usersService.delete(user.id);
  }
}
