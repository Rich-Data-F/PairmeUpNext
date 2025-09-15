import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IdentifierService {
  private readonly encryptionKey: string;

  constructor(private readonly configService: ConfigService) {
    this.encryptionKey = this.configService.get<string>('ID_ENCRYPTION_KEY');
    if (!this.encryptionKey || this.encryptionKey.length < 32) {
      throw new Error('ID_ENCRYPTION_KEY must be at least 32 characters long');
    }
  }

  /**
   * Encrypt a full identifier (serial number, device ID, etc.)
   * @param identifier - The full identifier to encrypt
   * @returns Encrypted identifier string
   */
  encrypt(identifier: string): string {
    if (!identifier) {
      throw new Error('Identifier cannot be empty');
    }

    try {
      const encrypted = CryptoJS.AES.encrypt(identifier, this.encryptionKey).toString();
      return encrypted;
    } catch (error) {
      throw new Error('Failed to encrypt identifier');
    }
  }

  /**
   * Decrypt an encrypted identifier
   * @param encryptedIdentifier - The encrypted identifier
   * @returns Decrypted identifier string
   */
  decrypt(encryptedIdentifier: string): string {
    if (!encryptedIdentifier) {
      throw new Error('Encrypted identifier cannot be empty');
    }

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedIdentifier, this.encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Invalid encrypted identifier');
      }
      
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt identifier');
    }
  }

  /**
   * Create a masked version of an identifier for public display
   * Format: ****E5F6 (shows last 4 characters)
   * @param identifier - The full identifier
   * @returns Masked identifier string
   */
  mask(identifier: string): string {
    if (!identifier) {
      return '';
    }

    // Ensure identifier is at least 4 characters
    if (identifier.length < 4) {
      return '****';
    }

    // Take last 4 characters and mask the rest
    const lastFour = identifier.slice(-4).toUpperCase();
    return `****${lastFour}`;
  }

  /**
   * Create a masked version from encrypted identifier
   * @param encryptedIdentifier - The encrypted identifier
   * @returns Masked identifier string
   */
  maskFromEncrypted(encryptedIdentifier: string): string {
    try {
      const decrypted = this.decrypt(encryptedIdentifier);
      return this.mask(decrypted);
    } catch (error) {
      return '****';
    }
  }

  /**
   * Validate if an identifier matches an encrypted identifier
   * @param plainIdentifier - The plain text identifier to check
   * @param encryptedIdentifier - The encrypted identifier to compare against
   * @returns True if identifiers match
   */
  validateIdentifier(plainIdentifier: string, encryptedIdentifier: string): boolean {
    try {
      const decrypted = this.decrypt(encryptedIdentifier);
      return plainIdentifier === decrypted;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if two encrypted identifiers represent the same identifier
   * @param encryptedId1 - First encrypted identifier
   * @param encryptedId2 - Second encrypted identifier
   * @returns True if they represent the same identifier
   */
  compareEncrypted(encryptedId1: string, encryptedId2: string): boolean {
    try {
      const decrypted1 = this.decrypt(encryptedId1);
      const decrypted2 = this.decrypt(encryptedId2);
      return decrypted1 === decrypted2;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate a partial match score for identifier matching
   * Used for smart matching in lost/found system
   * @param identifier1 - First identifier (plain text)
   * @param identifier2 - Second identifier (plain text)
   * @returns Match score between 0 and 1
   */
  calculateMatchScore(identifier1: string, identifier2: string): number {
    if (!identifier1 || !identifier2) {
      return 0;
    }

    // Exact match
    if (identifier1 === identifier2) {
      return 1.0;
    }

    // Case-insensitive match
    if (identifier1.toLowerCase() === identifier2.toLowerCase()) {
      return 0.95;
    }

    // Partial match - check if one contains the other
    const id1Lower = identifier1.toLowerCase();
    const id2Lower = identifier2.toLowerCase();
    
    if (id1Lower.includes(id2Lower) || id2Lower.includes(id1Lower)) {
      return 0.8;
    }

    // Character similarity (simple Jaccard similarity)
    const set1 = new Set(id1Lower.split(''));
    const set2 = new Set(id2Lower.split(''));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    const jaccardSimilarity = intersection.size / union.size;
    
    // Only consider it a match if similarity is high enough
    return jaccardSimilarity > 0.7 ? jaccardSimilarity : 0;
  }

  /**
   * Sanitize identifier input by removing common separators and normalizing
   * @param identifier - Raw identifier input
   * @returns Sanitized identifier
   */
  sanitizeIdentifier(identifier: string): string {
    if (!identifier) {
      return '';
    }

    return identifier
      .trim()
      .replace(/[-_\s:]/g, '') // Remove common separators
      .toUpperCase(); // Normalize to uppercase
  }

  /**
   * Validate identifier format (basic validation)
   * @param identifier - Identifier to validate
   * @returns True if identifier appears to be valid
   */
  isValidIdentifier(identifier: string): boolean {
    if (!identifier) {
      return false;
    }

    const sanitized = this.sanitizeIdentifier(identifier);
    
    // Must be between 4 and 50 characters
    if (sanitized.length < 4 || sanitized.length > 50) {
      return false;
    }

    // Must contain only alphanumeric characters
    const alphanumericRegex = /^[A-Z0-9]+$/;
    return alphanumericRegex.test(sanitized);
  }
}
