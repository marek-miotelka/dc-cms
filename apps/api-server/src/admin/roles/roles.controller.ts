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
import { AdminRolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/Role.dto';
import { JwtAuthGuard } from '@api-server/auth/jwt/jwt.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleFields, RoleModel } from './models/Role.model';

@ApiTags('admin/roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/roles')
export class AdminRolesController {
  constructor(private readonly rolesService: AdminRolesService) {}

  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: 201,
    description: 'The role has been successfully created',
    type: CreateRoleDto,
  })
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleFields> {
    const role = await this.rolesService.create(createRoleDto);
    return RoleModel.sanitize(role);
  }

  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: 'List of all roles',
    type: [CreateRoleDto],
  })
  @Get()
  async findAll(): Promise<RoleFields[]> {
    const roles = await this.rolesService.findAll();
    return roles.map(RoleModel.sanitize);
  }

  @ApiOperation({ summary: 'Get role by documentId' })
  @ApiResponse({
    status: 200,
    description: 'The found role',
    type: CreateRoleDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  @Get(':documentId')
  async findOne(@Param('documentId') documentId: string): Promise<RoleFields> {
    const role = await this.rolesService.findByDocumentId(documentId);
    return RoleModel.sanitize(role);
  }

  @ApiOperation({ summary: 'Update role by documentId' })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully updated',
    type: UpdateRoleDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  @Put(':documentId')
  async update(
    @Param('documentId') documentId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleFields> {
    const role = await this.rolesService.findByDocumentId(documentId);
    const updatedRole = await this.rolesService.update(role.id, updateRoleDto);
    return RoleModel.sanitize(updatedRole);
  }

  @ApiOperation({ summary: 'Delete role by documentId' })
  @ApiResponse({
    status: 204,
    description: 'The role has been successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('documentId') documentId: string): Promise<void> {
    const role = await this.rolesService.findByDocumentId(documentId);
    await this.rolesService.delete(role.id);
  }

  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({
    status: 204,
    description: 'Role has been successfully assigned to user',
  })
  @Post(':documentId/users/:userDocumentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async assignToUser(
    @Param('documentId') roleDocumentId: string,
    @Param('userDocumentId') userDocumentId: string,
  ): Promise<void> {
    const role = await this.rolesService.findByDocumentId(roleDocumentId);
    const user = await this.rolesService.findByDocumentId(userDocumentId);
    await this.rolesService.assignRoleToUser(user.id, role.id);
  }

  @ApiOperation({ summary: 'Remove role from user' })
  @ApiResponse({
    status: 204,
    description: 'Role has been successfully removed from user',
  })
  @Delete(':documentId/users/:userDocumentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromUser(
    @Param('documentId') roleDocumentId: string,
    @Param('userDocumentId') userDocumentId: string,
  ): Promise<void> {
    const role = await this.rolesService.findByDocumentId(roleDocumentId);
    const user = await this.rolesService.findByDocumentId(userDocumentId);
    await this.rolesService.removeRoleFromUser(user.id, role.id);
  }
}
