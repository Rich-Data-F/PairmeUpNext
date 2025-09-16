import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConversationsController } from './conversations.controller';
import { MessagesController } from './messages.controller';
import { OffersController } from './offers.controller';
import { NegotiationService } from './negotiation.service';

@Module({
  imports: [PrismaModule],
  controllers: [ConversationsController, MessagesController, OffersController],
  providers: [NegotiationService],
})
export class NegotiationModule {}
