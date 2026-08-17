import { Controller, Post, Get, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService, AiQueryDto } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentBusinessId } from '../../common/decorators/context.decorator';
import { Public } from '../../common/decorators/custom.decorator';

@ApiTags('AI Assistant')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('query')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a prompt or business question to Boshqar AI' })
  async processQuery(
    @Body() dto: AiQueryDto,
    @CurrentUser('id') userId: string,
    @CurrentBusinessId() businessId: string,
  ) {
    return this.aiService.processQuery(dto, userId, businessId);
  }

  @Public()
  @Post('public-query')
  @ApiOperation({ summary: 'Public/Guest query to Boshqar AI' })
  async processPublicQuery(@Body() dto: AiQueryDto) {
    return this.aiService.processQuery(dto);
  }

  @Get('suggested-prompts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get smart dynamic prompt suggestions for business' })
  async getSuggestedPrompts(@CurrentBusinessId() businessId: string) {
    return this.aiService.getSuggestedPrompts(businessId);
  }

  @Public()
  @Get('public-prompts')
  @ApiOperation({ summary: 'Get general prompt suggestions' })
  async getPublicPrompts(@Query('businessId') businessId?: string) {
    return this.aiService.getSuggestedPrompts(businessId);
  }
}
