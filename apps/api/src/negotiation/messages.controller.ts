import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NegotiationService } from './negotiation.service';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations/:id/messages')
export class MessagesController {
  constructor(private readonly negotiation: NegotiationService) {}

  @Get()
  @ApiOperation({ summary: 'List messages in a conversation' })
  async list(@Request() req: any, @Param('id') conversationId: string) {
    return { messages: await this.negotiation.listMessages(conversationId, req.user.id) };
  }

  @Post()
  @ApiOperation({ summary: 'Send a message in a conversation' })
  async send(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Body() body: { content: string; messageType?: 'TEXT' | 'SYSTEM' | 'OFFER' }
  ) {
    const msg = await this.negotiation.sendMessage(conversationId, req.user.id, body.content, body.messageType || 'TEXT');
    return msg;
  }
}
