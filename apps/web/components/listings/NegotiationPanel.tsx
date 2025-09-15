'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'OFFER' | 'SYSTEM';
  createdAt: string;
  sender?: {
    name: string;
    verificationBadge?: string;
  };
}

interface Offer {
  id: string;
  amount: number;
  currency: string;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  createdAt: string;
}

interface NegotiationProps {
  listingId: string;
  sellerId: string;
  currentUserId?: string;
  listingPrice: number;
  listingCurrency: string;
}

export function NegotiationPanel({ 
  listingId, 
  sellerId, 
  currentUserId,
  listingPrice,
  listingCurrency = 'EUR'
}: NegotiationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUserId && currentUserId !== sellerId) {
      initializeConversation();
    }
  }, [currentUserId, listingId, sellerId]);

  const initializeConversation = async () => {
    try {
      // Try to get existing conversation or create new one
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          sellerId
        })
      });

      if (response.ok) {
        const conversation = await response.json();
        setConversationId(conversation.id);
        loadMessages(conversation.id);
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const response = await fetch(`/api/conversations/${convId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          messageType: 'TEXT'
        })
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        toast.success('Message sent!');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const sendOffer = async () => {
    const amount = parseFloat(offerAmount);
    if (!amount || amount <= 0 || !conversationId) {
      toast.error('Please enter a valid offer amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: listingCurrency,
          message: `Offer: ${amount} ${listingCurrency}`
        })
      });

      if (response.ok) {
        const offer = await response.json();
        // Add offer as a message
        const offerMessage: Message = {
          id: offer.id,
          senderId: currentUserId || '',
          content: `Offered ${amount} ${listingCurrency}`,
          messageType: 'OFFER',
          createdAt: offer.createdAt
        };
        setMessages(prev => [...prev, offerMessage]);
        setOfferAmount('');
        toast.success('Offer sent!');
      } else {
        toast.error('Failed to send offer');
      }
    } catch (error) {
      toast.error('Failed to send offer');
    } finally {
      setLoading(false);
    }
  };

  // Don't show panel if user is the seller or not logged in
  if (!currentUserId || currentUserId === sellerId) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h3 className="text-lg font-semibold mb-4">Contact Seller</h3>
      
      {/* Messages */}
      <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === currentUserId 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border'
                } ${message.messageType === 'OFFER' ? 'border-green-500' : ''}`}>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="space-y-3">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>

        {/* Offer Input */}
        <div className="flex space-x-2 pt-2 border-t border-gray-200">
          <input
            type="number"
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            placeholder={`Make an offer (Listed: ${listingPrice} ${listingCurrency})`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            min="0"
            step="0.01"
          />
          <button
            onClick={sendOffer}
            disabled={loading || !offerAmount}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Offer
          </button>
        </div>
      </div>
    </div>
  );
}
