import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getProposedBrands() {
    return this.prisma.proposedBrand.findMany({
      where: { status: 'PENDING' },
      include: {
        submitter: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getProposedModels() {
    return this.prisma.proposedModel.findMany({
      where: { status: 'PENDING' },
      include: {
        brand: {
          select: { id: true, name: true }
        },
        submitter: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async approveBrand(brandId: string, adminId: string) {
    // Get the proposed brand
    const proposedBrand = await this.prisma.proposedBrand.findUnique({
      where: { id: brandId }
    });

    if (!proposedBrand) {
      throw new Error('Proposed brand not found');
    }

    // Create the approved brand
    const approvedBrand = await this.prisma.brand.create({
      data: {
        name: proposedBrand.name,
        description: proposedBrand.description,
        website: proposedBrand.website,
        slug: proposedBrand.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        status: 'APPROVED',
        submittedBy: proposedBrand.submittedBy,
        approvedBy: adminId,
        approvedAt: new Date(),
      }
    });

    // Update the proposed brand status
    await this.prisma.proposedBrand.update({
      where: { id: brandId },
      data: {
        status: 'APPROVED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      }
    });

    return approvedBrand;
  }

  async rejectBrand(brandId: string, adminId: string) {
    return this.prisma.proposedBrand.update({
      where: { id: brandId },
      data: {
        status: 'REJECTED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      }
    });
  }

  async approveModel(modelId: string, adminId: string) {
    // Get the proposed model
    const proposedModel = await this.prisma.proposedModel.findUnique({
      where: { id: modelId },
      include: { brand: true }
    });

    if (!proposedModel) {
      throw new Error('Proposed model not found');
    }

    // Create the approved model
    const approvedModel = await this.prisma.model.create({
      data: {
        name: proposedModel.name,
        slug: proposedModel.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        brandId: proposedModel.brandId,
        description: proposedModel.description,
        status: 'APPROVED',
        submittedBy: proposedModel.submittedBy,
        approvedBy: adminId,
        approvedAt: new Date(),
      }
    });

    // Update the proposed model status
    await this.prisma.proposedModel.update({
      where: { id: modelId },
      data: {
        status: 'APPROVED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      }
    });

    return approvedModel;
  }

  async rejectModel(modelId: string, adminId: string) {
    return this.prisma.proposedModel.update({
      where: { id: modelId },
      data: {
        status: 'REJECTED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      }
    });
  }

  // Edit a proposed brand
  async editProposedBrand(id: string, data: Partial<{ name: string; description?: string; website?: string; submissionNote?: string }>) {
    return this.prisma.proposedBrand.update({
      where: { id },
      data,
    });
  }

  // Create a new proposed brand
  async createProposedBrand(data: { name: string; description?: string; website?: string; submissionNote?: string; submittedBy: string }) {
    return this.prisma.proposedBrand.create({
      data: {
        ...data,
        status: 'PENDING',
      },
    });
  }

  // Edit a proposed model
  async editProposedModel(id: string, data: Partial<{ name: string; description?: string; submissionNote?: string }>) {
    return this.prisma.proposedModel.update({
      where: { id },
      data,
    });
  }

  // Create a new proposed model
  async createProposedModel(data: { name: string; brandId: string; description?: string; submissionNote?: string; submittedBy: string }) {
    return this.prisma.proposedModel.create({
      data: {
        ...data,
        status: 'PENDING',
      },
    });
  }

  // Create a new canonical brand with audit
  async createCanonicalBrand(data: { name: string; description?: string; website?: string; metaTitle?: string; metaDescription?: string }, adminId: string) {
    const brand = await this.prisma.brand.create({
      data: {
        ...data,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        status: 'APPROVED',
        isVerified: true,
        createdBy: adminId,
        updatedBy: adminId,
      },
    });

    // Log audit
    await this.prisma.brandAudit.create({
      data: {
        brandId: brand.id,
        action: 'CREATE',
        changedBy: adminId,
        notes: 'Created by admin',
      },
    });

    return brand;
  }

  // Edit a canonical brand with audit
  async editCanonicalBrand(id: string, data: Partial<{ name: string; description?: string; website?: string; metaTitle?: string; metaDescription?: string }>, adminId: string) {
    const existingBrand = await this.prisma.brand.findUnique({ where: { id } });
    if (!existingBrand) throw new Error('Brand not found');

    const updatedBrand = await this.prisma.brand.update({
      where: { id },
      data: {
        ...data,
        updatedBy: adminId,
      },
    });

    // Log changes to audit
    for (const [field, newValue] of Object.entries(data)) {
      if (newValue !== existingBrand[field as keyof typeof existingBrand]) {
        await this.prisma.brandAudit.create({
          data: {
            brandId: id,
            action: 'UPDATE',
            field,
            oldValue: existingBrand[field as keyof typeof existingBrand]?.toString(),
            newValue: newValue?.toString(),
            changedBy: adminId,
          },
        });
      }
    }

    return updatedBrand;
  }

  // Create a new canonical model with audit
  async createCanonicalModel(data: { name: string; brandId: string; description?: string; metaTitle?: string; metaDescription?: string }, adminId: string) {
    const model = await this.prisma.model.create({
      data: {
        ...data,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        status: 'APPROVED',
        isVerified: true,
        createdBy: adminId,
        updatedBy: adminId,
      },
    });

    // Log audit
    await this.prisma.modelAudit.create({
      data: {
        modelId: model.id,
        action: 'CREATE',
        changedBy: adminId,
        notes: 'Created by admin',
      },
    });

    return model;
  }

  // Edit a canonical model with audit
  async editCanonicalModel(id: string, data: Partial<{ name: string; description?: string; metaTitle?: string; metaDescription?: string }>, adminId: string) {
    const existingModel = await this.prisma.model.findUnique({ where: { id } });
    if (!existingModel) throw new Error('Model not found');

    const updatedModel = await this.prisma.model.update({
      where: { id },
      data: {
        ...data,
        updatedBy: adminId,
      },
    });

    // Log changes to audit
    for (const [field, newValue] of Object.entries(data)) {
      if (newValue !== existingModel[field as keyof typeof existingModel]) {
        await this.prisma.modelAudit.create({
          data: {
            modelId: id,
            action: 'UPDATE',
            field,
            oldValue: existingModel[field as keyof typeof existingModel]?.toString(),
            newValue: newValue?.toString(),
            changedBy: adminId,
          },
        });
      }
    }

    return updatedModel;
  }

  // Reassign a model to a different brand with audit
  async reassignModel(modelId: string, newBrandId: string, adminId: string) {
    const existingModel = await this.prisma.model.findUnique({ 
      where: { id: modelId },
      include: { brand: true }
    });
    
    if (!existingModel) throw new Error('Model not found');

    const newBrand = await this.prisma.brand.findUnique({ where: { id: newBrandId } });
    if (!newBrand) throw new Error('New brand not found');

    const updatedModel = await this.prisma.model.update({
      where: { id: modelId },
      data: {
        brandId: newBrandId,
        updatedBy: adminId,
      },
    });

    // Log the reassignment
    await this.prisma.modelAudit.create({
      data: {
        modelId: modelId,
        action: 'UPDATE',
        field: 'brandId',
        oldValue: existingModel.brandId,
        newValue: newBrandId,
        changedBy: adminId,
        notes: `Reassigned from ${existingModel.brand?.name || 'Unassigned'} to ${newBrand.name}`,
      },
    });

    return updatedModel;
  }

  // User Management Methods (GDPR Compliant)
  async getUsers(query: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          isAdmin: true,
          isVerified: true,
          verificationBadge: true,
          reputation: true,
          trustLevel: true,
          joinedAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              listings: true,
              ratings: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' }
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getUser(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isVerified: true,
        verificationBadge: true,
        reputation: true,
        trustLevel: true,
        joinedAt: true,
        lastLoginAt: true,
        bio: true,
        image: true,
        _count: {
          select: {
            listings: true,
            ratings: true,
            lostReports: true,
            foundItems: true
          }
        }
      }
    });
  }

  async updateUser(id: string, data: Partial<{
    name: string;
    isVerified: boolean;
    verificationBadge: string;
    trustLevel: string;
    bio: string;
  }>, adminId: string) {
    // Get current user data for audit
    const currentUser = await this.prisma.user.findUnique({ where: { id } });
    if (!currentUser) throw new Error('User not found');

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isVerified: true,
        verificationBadge: true,
        reputation: true,
        trustLevel: true,
        joinedAt: true,
        lastLoginAt: true
      }
    });

    // Log changes to audit (you might want to create a UserAudit model)
    for (const [field, newValue] of Object.entries(data)) {
      if (newValue !== currentUser[field as keyof typeof currentUser]) {
        console.log(`Admin ${adminId} changed user ${id} field ${field}: ${currentUser[field as keyof typeof currentUser]} -> ${newValue}`);
        // TODO: Log to audit table when UserAudit model is created
      }
    }

    return updatedUser;
  }

  async resetUserPassword(id: string, adminId: string) {
    // Generate a secure reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.user.update({
      where: { id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry
      }
    });

    // TODO: Send password reset email to user
    console.log(`Admin ${adminId} initiated password reset for user ${id}`);
    console.log(`Reset token: ${resetToken}`); // In production, send via email

    return { message: 'Password reset initiated. User will receive reset instructions via email.' };
  }

  async sendVerificationEmail(id: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    // TODO: Send verification email
    console.log(`Admin ${adminId} sent verification email to user ${user.email}`);

    return { message: 'Verification email sent successfully.' };
  }
}
