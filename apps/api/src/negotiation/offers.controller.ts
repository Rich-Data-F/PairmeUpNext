import { Controller, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NegotiationService } from './negotiation.service';

@ApiTags('offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations/:id/offers')
export class OffersController {
  constructor(private readonly negotiation: NegotiationService) {}

  @Post()
  @ApiOperation({ summary: 'Create an offer in a conversation' })
  async create(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Body() body: { amount: number; currency: string; message?: string }
  ) {
    return this.negotiation.createOffer(conversationId, req.user.id, body.amount, body.currency, body.message);
  }

  @Post(':offerId/accept')
  @ApiOperation({ summary: 'Accept an offer' })
  async accept(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Param('offerId') offerId: string,
  ) {
    return this.negotiation.acceptOffer(conversationId, offerId, req.user.id);
  }

  @Post(':offerId/decline')
  @ApiOperation({ summary: 'Decline an offer' })
  async decline(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Param('offerId') offerId: string,
  ) {
    return this.negotiation.declineOffer(conversationId, offerId, req.user.id);
  }
}
