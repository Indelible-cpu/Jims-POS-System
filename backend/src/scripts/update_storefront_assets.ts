
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updateData = async () => {
  const products = await prisma.product.findMany();
  
  for (const p of products) {
    let description = p.description;
    let imageUrl = '/premium-item.png';

    // Map Images and Descriptions based on name/category
    if (p.categoryId === 2) { // Stationery
      imageUrl = '/stationery.png';
      description = `High-quality ${p.name} for office and home use. Essential for productivity.`;
    } else if (p.categoryId === 3) { // Services
      imageUrl = '/repair.png';
      description = `Professional ${p.name} service. Fast turnaround, reliable results by experts.`;
    } else if (p.categoryId === 1) { // Phone Accessories
      if (p.name.toLowerCase().includes('cable') || p.name.toLowerCase().includes('usb')) {
        imageUrl = '/cables.png';
        description = `Durable ${p.name}. High-speed data transfer and fast charging support.`;
      } else {
        imageUrl = '/premium-item.png';
        description = `Premium ${p.name} accessory. Designed for longevity and style.`;
      }
    }

    // Special cases
    if (p.name.toLowerCase().includes('password') || p.name.toLowerCase().includes('removal')) {
      description = `Expert ${p.name}. Securely unlock your device without data loss. Professional bypass.`;
    }
    if (p.name.toLowerCase().includes('printing') || p.name.toLowerCase().includes('photocopying')) {
      description = `High-resolution ${p.name}. Sharp text and clear images on premium paper.`;
    }

    await prisma.product.update({
      where: { id: p.id },
      data: { description, imageUrl }
    });
  }

  console.log('Successfully updated product images and descriptions.');
};

updateData()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
