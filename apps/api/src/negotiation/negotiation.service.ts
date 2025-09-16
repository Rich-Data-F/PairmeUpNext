import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { $Enums } from '@prisma/client';

@Injectable()
export class NegotiationService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateConversation(listingId: string, buyerId: string) {
    // Get listing and seller
  const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.sellerId === buyerId) throw new ForbiddenException('Cannot start conversation on your own listing');

  const existing = await this.prisma.conversation.findUnique({
      where: { listingId_buyerId: { listingId, buyerId } },
    });
    if (existing) return existing;

  return this.prisma.conversation.create({
      data: { listingId, buyerId, sellerId: listing.sellerId },
    });
  }

  async ensureParticipant(conversationId: string, userId: string) {
  const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.buyerId !== userId && conv.sellerId !== userId) {
      throw new ForbiddenException('Not a participant');
    }
    return conv;
  }

  async listMessages(conversationId: string, userId: string) {
    await this.ensureParticipant(conversationId, userId);
  return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(conversationId: string, userId: string, content: string, messageType: 'TEXT' | 'SYSTEM' | 'OFFER' = 'TEXT') {
    await this.ensureParticipant(conversationId, userId);
    if (!content || !content.trim()) throw new BadRequestException('Message required');
  return this.prisma.message.create({
      data: { conversationId, senderId: userId, content, messageType },
    });
  }

  async createOffer(conversationId: string, userId: string, amount: number, currency: string, message?: string) {
    const conv = await this.ensureParticipant(conversationId, userId);
    if (!amount || amount <= 0) throw new BadRequestException('Invalid amount');
  const offer = await this.prisma.offer.create({
      data: { conversationId, senderId: userId, amount, currency, message },
    });
    // Echo as message for thread visibility
  await this.prisma.message.create({
      data: { conversationId, senderId: userId, content: message || `Offered ${amount} ${currency}`, messageType: 'OFFER' },
    });
    return offer;
  }

  async acceptOffer(conversationId: string, offerId: string, userId: string) {
    const conv = await this.ensureParticipant(conversationId, userId);
    // Only counterparty can accept: if buyer sent offer, seller accepts; if seller sent, buyer accepts
  const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer || offer.conversationId !== conversationId) throw new NotFoundException('Offer not found');
    const canAccept = offer.senderId === conv.buyerId ? userId === conv.sellerId : userId === conv.buyerId;
    if (!canAccept) throw new ForbiddenException('Cannot accept your own offer');
  const updated = await this.prisma.offer.update({ where: { id: offerId }, data: { status: $Enums.OfferStatus.ACCEPTED } });
  await this.prisma.conversation.update({ where: { id: conversationId }, data: { status: $Enums.ConversationStatus.CLOSED } });
    return updated;
  }

  async declineOffer(conversationId: string, offerId: string, userId: string) {
    await this.ensureParticipant(conversationId, userId);
  const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer || offer.conversationId !== conversationId) throw new NotFoundException('Offer not found');
  return this.prisma.offer.update({ where: { id: offerId }, data: { status: $Enums.OfferStatus.DECLINED } });
  }
}
