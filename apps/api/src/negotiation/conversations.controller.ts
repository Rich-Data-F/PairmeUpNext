import { Controller, Post, Get, Param, Body, UseGuards, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NegotiationService } from './negotiation.service';

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly negotiation: NegotiationService) {}

  @Post()
  @ApiOperation({ summary: 'Get or create conversation for a listing and buyer' })
  async create(@Request() req: any, @Body() body: { listingId: string }) {
    const buyerId = req.user.id;
    return this.negotiation.getOrCreateConversation(body.listingId, buyerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation by id (authorization enforced)' })
  async getOne(@Request() req: any, @Param('id') id: string) {
    return this.negotiation.ensureParticipant(id, req.user.id);
  }
}
