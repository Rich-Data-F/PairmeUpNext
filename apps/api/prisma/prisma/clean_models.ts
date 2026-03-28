import { PrismaClient, Model } from '@prisma/client';

const prisma = new PrismaClient();

interface ModelWithCount extends Model {
  _count: {
    listings: number;
    lostReports: number;
    foundItems: number;
  }
}

async function cleanDuplicateModels() {
  console.log('--- Model Deduplication script started ---');
  
  // 1. Fetch all models with their brand associations
  const models = await prisma.model.findMany({
    include: {
      _count: {
        select: { 
          listings: true,
          lostReports: true,
          foundItems: true
        }
      }
    }
  }) as ModelWithCount[];

  const grouped: Map<string, ModelWithCount[]> = new Map();

  // 2. Group by brandId and lower-cased name
  console.log(`Processing ${models.length} total models...`);
  for (const m of models) {
    const key = `${m.brandId}|${m.name.toLowerCase().trim()}`;
    const group = grouped.get(key) || [];
    group.push(m);
    grouped.set(key, group);
  }

  let totalMerges = 0;
  let totalDeleted = 0;

  // 3. Process groups with duplicates
  for (const [key, group] of grouped.entries()) {
    if (group.length > 1) {
      // Pick the "best" model as the survivor (prefer SYSTEM > APPROVED > PENDING status, then most combined counts)
      group.sort((a, b) => {
        const getStatusScore = (s: string) => {
          if (s === 'SYSTEM') return 100;
          if (s === 'APPROVED') return 50;
          return 0;
        };
        const countsA = (a._count.listings || 0) + (a._count.lostReports || 0) + (a._count.foundItems || 0);
        const countsB = (b._count.listings || 0) + (b._count.lostReports || 0) + (b._count.foundItems || 0);
        const scoreA = getStatusScore(a.status) + countsA;
        const scoreB = getStatusScore(b.status) + countsB;
        return scoreB - scoreA;
      });

      const survivor = group[0];
      const duplicates = group.slice(1);

      console.log(`--- [GROUP: "${key}"] ---`);
      console.log(`  SURVIVOR: "${survivor.name}" (ID: ${survivor.id}, Status: ${survivor.status}, Total Counts: ${survivor._count.listings + survivor._count.lostReports + survivor._count.foundItems})`);

      for (const dupe of duplicates) {
        console.log(`  DUPLICATE: "${dupe.name}" (ID: ${dupe.id}, Status: ${dupe.status})`);
        
        // 4. Move all relations to the survivor
        // Listings
        const moveListings = await prisma.listing.updateMany({ where: { modelId: dupe.id }, data: { modelId: survivor.id } });
        console.log(`    Moved ${moveListings.count} listings`);

        // Lost Reports
        const moveLost = await prisma.lostReport.updateMany({ where: { modelId: dupe.id }, data: { modelId: survivor.id } });
        console.log(`    Moved ${moveLost.count} lost reports`);

        // Found Items
        const moveFound = await prisma.foundItem.updateMany({ where: { modelId: dupe.id }, data: { modelId: survivor.id } });
        console.log(`    Moved ${moveFound.count} found items`);

        // Ratings
        const moveRatings = await prisma.rating.updateMany({ where: { modelId: dupe.id }, data: { modelId: survivor.id } });
        console.log(`    Moved ${moveRatings.count} ratings`);

        // Blog Posts
        await prisma.blogPost.updateMany({ where: { modelId: dupe.id }, data: { modelId: survivor.id } });
        
        // Sponsored Links
        await prisma.sponsoredLink.updateMany({ where: { modelId: dupe.id }, data: { modelId: survivor.id } });

        // Audit History
        await prisma.modelAudit.updateMany({ where: { modelId: dupe.id }, data: { modelId: survivor.id } });

        // 5. Delete the duplicate model
        try {
          await prisma.model.delete({ where: { id: dupe.id } });
          console.log(`    Successfully deleted duplicate: ${dupe.id}`);
          totalDeleted++;
        } catch (e: any) {
          console.error(`    FAILED to delete dupe ${dupe.id}: ${e.message}`);
        }
      }
      totalMerges++;
    }
  }

  console.log(`--- Deduplication complete. ---`);
  console.log(`Groups processed: ${grouped.size}`);
  console.log(`Groups merged: ${totalMerges}`);
  console.log(`Duplicate models deleted: ${totalDeleted}`);
}

cleanDuplicateModels()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
