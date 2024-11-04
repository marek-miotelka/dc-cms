import { Controller, Get } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth/providers')
export class ProvidersController {
  constructor(private readonly providerService: ProviderService) {}

  @ApiOperation({ summary: 'Get enabled authentication providers' })
  @ApiResponse({
    status: 200,
    description: 'List of enabled authentication providers',
    schema: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['local', 'google'],
      },
    },
  })
  @Get()
  getEnabledProviders() {
    return {
      providers: this.providerService.getEnabledProviders(),
    };
  }
}
