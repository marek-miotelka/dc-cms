import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
import { UserFields } from './models/User.model';

/**
 * Controller handling user-related HTTP requests
 * All routes require JWT authentication
 */
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  /**
   * Creates a new user
   * @param createUserDto - The user data to create
   * @returns Promise resolving to the created user
   */
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created',
    type: CreateUserDto,
  })
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserFields> {
    return this.usersService.createUser(createUserDto);
  }

  /**
   * Retrieves all users
   * @returns Promise resolving to an array of users
   */
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [CreateUserDto],
  })
  @Get()
  async findAll(): Promise<UserFields[]> {
    return this.usersService.findAll();
  }

  /**
   * Retrieves a specific user by ID
   * @param id - The ID of the user to retrieve
   * @returns Promise resolving to the found user
   * @throws NotFoundException if user is not found
   */
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The found user',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserFields> {
    return this.usersService.findById(id);
  }

  /**
   * Updates an existing user
   * @param id - The ID of the user to update
   * @param updateUserDto - The updated user data
   * @returns Promise resolving to the updated user
   * @throws NotFoundException if user is not found
   */
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated',
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserFields> {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Deletes a user
   * @param id - The ID of the user to delete
   * @throws NotFoundException if user is not found
   */
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({
    status: 204,
    description: 'The user has been successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.delete(id);
  }
}
