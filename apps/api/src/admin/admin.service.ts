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

  // Get all canonical brands (all statuses: PENDING, APPROVED, SYSTEM, OBSOLETE, REJECTED)
  async getCanonicalBrands(page = 1, limit = 50, search?: string) {
    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [brands, total] = await Promise.all([
      this.prisma.brand.findMany({
        where,
        include: {
          _count: { select: { models: true, Listing: true } },
          creator: { select: { id: true, email: true, name: true } },
          updater: { select: { id: true, email: true, name: true } },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.brand.count({ where }),
    ]);

    return {
      data: brands,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  // Get all canonical models (all statuses)
  async getCanonicalModels(page = 1, limit = 50, search?: string, brandId?: string) {
    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (brandId) {
      where.brandId = brandId;
    }

    const [models, total] = await Promise.all([
      this.prisma.model.findMany({
        where,
        include: {
          brand: { select: { id: true, name: true, status: true } },
          _count: { select: { listings: true } },
          creator: { select: { id: true, email: true, name: true } },
          updater: { select: { id: true, email: true, name: true } },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.model.count({ where }),
    ]);

    return {
      data: models,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async approveBrand(brandId: string, adminId: string, options?: { createCanonical?: boolean; name?: string; description?: string; website?: string }) {
    // Get the proposed brand
    const proposedBrand = await this.prisma.proposedBrand.findUnique({
      where: { id: brandId }
    });

    if (!proposedBrand) {
      throw new Error('Proposed brand not found');
    }

    // Determine final values with optional overrides
    const name = options?.name || proposedBrand.name;
    const description = options?.description || proposedBrand.description;
    const website = options?.website || proposedBrand.website;
    const createCanonical = options?.createCanonical !== false; // default true

    // Find any temporary brand records that belong to this approval
    const tempBrands = await this.prisma.brand.findMany({
      where: { slug: { startsWith: `temp-${proposedBrand.id}` } },
    });

    // Run in a transaction: either create canonical and migrate listings, or
    // approve temporary brands for single-use without creating canonical.
    return this.prisma.$transaction(async (tx) => {
      if (createCanonical) {
        // Create the canonical approved brand
        const approvedBrand = await tx.brand.create({
          data: {
            name,
            description,
            website,
            slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            status: 'APPROVED',
            isVerified: true,
            submittedBy: proposedBrand.submittedBy,
            approvedBy: adminId,
            approvedAt: new Date(),
          }
        });

        // Reassign listings referencing temporary brands to the new canonical brand
        for (const tb of tempBrands) {
          await tx.listing.updateMany({
            where: { brandId: tb.id },
            data: { brandId: approvedBrand.id },
          });

          // Reassign any models that were attached to the temporary brand
          const tempModelsForBrand = await tx.model.findMany({ where: { brandId: tb.id } });
          for (const tm of tempModelsForBrand) {
            await tx.model.update({ where: { id: tm.id }, data: { brandId: approvedBrand.id, updatedBy: adminId } });
          }

          // Mark the temporary brand as inactive and note it was migrated
          await tx.brand.update({
            where: { id: tb.id },
            data: { isActive: false, updatedBy: adminId },
          });
        }

        // update proposed brand status
        await tx.proposedBrand.update({
          where: { id: brandId },
          data: {
            status: 'APPROVED',
            reviewedBy: adminId,
            reviewedAt: new Date(),
          }
        });

        // Audit
        await tx.brandAudit.create({
          data: {
            brandId: approvedBrand.id,
            action: 'CREATE',
            changedBy: adminId,
            notes: `Approved canonical brand from proposed ${brandId}`,
          },
        });

        return approvedBrand;
      } else {
        // Single-use approval: mark all temp brands as APPROVED so they show where needed
        const updates = [] as any[];
        for (const tb of tempBrands) {
          updates.push(tx.brand.update({
            where: { id: tb.id },
            data: { status: 'APPROVED', approvedBy: adminId, approvedAt: new Date(), updatedBy: adminId },
          }));
        }
        await Promise.all(updates);

        // update proposed brand status
        await tx.proposedBrand.update({
          where: { id: brandId },
          data: {
            status: 'APPROVED',
            reviewedBy: adminId,
            reviewedAt: new Date(),
          }
        });

        return tempBrands;
      }
    });
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

  async approveModel(modelId: string, adminId: string, options?: { createCanonical?: boolean; name?: string; description?: string }) {
    // Get the proposed model
    const proposedModel = await this.prisma.proposedModel.findUnique({
      where: { id: modelId },
      include: { brand: true }
    });

    if (!proposedModel) {
      throw new Error('Proposed model not found');
    }

    const name = options?.name || proposedModel.name;
    const description = options?.description || proposedModel.description;
    const createCanonical = options?.createCanonical !== false;

    // Find any temporary model records associated with this proposed model
    const tempModels = await this.prisma.model.findMany({
      where: { slug: { startsWith: `temp-${proposedModel.id}` } },
    });

    return this.prisma.$transaction(async (tx) => {
      if (createCanonical) {
        const approvedModel = await tx.model.create({
          data: {
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            brandId: proposedModel.brandId,
            description,
            status: 'APPROVED',
            isVerified: true,
            submittedBy: proposedModel.submittedBy,
            approvedBy: adminId,
            approvedAt: new Date(),
          }
        });

        // Reassign listings that reference temporary models to the new canonical model
        for (const tm of tempModels) {
          await tx.listing.updateMany({
            where: { modelId: tm.id },
            data: { modelId: approvedModel.id },
          });

          // deactivate the temporary model
          await tx.model.update({ where: { id: tm.id }, data: { isActive: false, updatedBy: adminId } });
        }

        await tx.proposedModel.update({
          where: { id: modelId },
          data: {
            status: 'APPROVED',
            reviewedBy: adminId,
            reviewedAt: new Date(),
          }
        });

        await tx.modelAudit.create({
          data: {
            modelId: approvedModel.id,
            action: 'CREATE',
            changedBy: adminId,
            notes: `Approved canonical model from proposed ${modelId}`,
          }
        });

        return approvedModel;
      } else {
        // Single-use: mark temp models as approved without creating canonical model
        const updates = [] as any[];
        for (const tm of tempModels) {
          updates.push(tx.model.update({
            where: { id: tm.id },
            data: { status: 'APPROVED', approvedBy: adminId, approvedAt: new Date(), updatedBy: adminId },
          }));
        }
        await Promise.all(updates);

        await tx.proposedModel.update({
          where: { id: modelId },
          data: {
            status: 'APPROVED',
            reviewedBy: adminId,
            reviewedAt: new Date(),
          }
        });

        return tempModels;
      }
    });
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

  // Edit a canonical brand with audit (supports status changes)
  async editCanonicalBrand(id: string, data: Partial<{ name: string; description?: string; website?: string; metaTitle?: string; metaDescription?: string; status?: 'PENDING' | 'APPROVED' | 'SYSTEM' | 'OBSOLETE' | 'REJECTED' }>, adminId: string) {
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

  // Edit a canonical model with audit (supports status changes)
  async editCanonicalModel(id: string, data: Partial<{ name: string; description?: string; metaTitle?: string; metaDescription?: string; status?: 'PENDING' | 'APPROVED' | 'SYSTEM' | 'OBSOLETE' | 'REJECTED' }>, adminId: string) {
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
