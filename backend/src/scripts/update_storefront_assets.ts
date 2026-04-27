import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updateData = async () => {
  const products = await prisma.product.findMany({ include: { category: true } });
  
  for (const p of products) {
    let description = p.description;
    const name = p.name.toLowerCase();

    // Assign unique descriptions based on product name and category
    if (p.category?.title === 'Stationery Items' || p.categoryId === 2) {
      description = `High-quality ${p.name} for office and home use. Essential stationery for everyday productivity.`;
    } else if (p.category?.title === 'Services' || p.categoryId === 3) {
      if (name.includes('password')) {
        description = `Expert ${p.name} service. Securely unlock your device without data loss. Professional bypass by certified technicians.`;
      } else if (name.includes('printing')) {
        description = `High-resolution ${p.name} service. Sharp text and clear images on premium paper stock.`;
      } else if (name.includes('photocopying')) {
        description = `Fast and reliable ${p.name} service. Crystal-clear copies every time.`;
      } else if (name.includes('typing')) {
        description = `Professional ${p.name} service. Accurate document preparation with fast turnaround.`;
      } else if (name.includes('scanning')) {
        description = `Digital ${p.name} service. Convert physical documents to high-quality digital files.`;
      } else if (name.includes('lamination')) {
        description = `Premium ${p.name} service. Protect your documents with durable, glossy laminate finish.`;
      } else if (name.includes('factory reset')) {
        description = `Complete ${p.name} service. Restore your device to factory settings safely and securely.`;
      } else if (name.includes('whatsapp')) {
        description = `${p.name} setup and configuration service. Get connected quickly with expert assistance.`;
      } else if (name.includes('google')) {
        description = `Professional ${p.name} service. Bypass FRP lock safely with zero data loss.`;
      } else if (name.includes('software') || name.includes('pc')) {
        description = `Expert ${p.name} service. Diagnose and fix software issues, virus removal, and OS optimization.`;
      } else {
        description = `Professional ${p.name} service. Fast turnaround and reliable results by certified experts.`;
      }
    } else if (p.categoryId === 1) { // Phone Accessories
      if (name.includes('cable') || name.includes('usb') || name.includes('rks') || name.includes('silvia') || name.includes('protea')) {
        description = `Durable ${p.name}. High-speed data transfer and fast charging support. Built to last.`;
      } else if (name.includes('earphone') || name.includes('oraimo earphone') || name.includes('rxd')) {
        description = `${p.name} with rich bass and crystal-clear audio. Comfortable fit for all-day listening.`;
      } else if (name.includes('battery') || name.includes('bl5c') || name.includes('bl25') || name.includes('25bi')) {
        description = `Reliable ${p.name}. Long-lasting power to keep your device running all day.`;
      } else if (name.includes('case') || name.includes('cover') || name.includes('silicon') || name.includes('cotton')) {
        description = `Stylish ${p.name}. Premium protection with a sleek design that fits perfectly.`;
      } else if (name.includes('protector') || name.includes('privacy') || name.includes('full glue')) {
        description = `${p.name}. Shatterproof tempered glass with edge-to-edge coverage for maximum screen protection.`;
      } else if (name.includes('charger') || name.includes('charge') || name.includes('adapter')) {
        description = `${p.name}. Fast and efficient charging with built-in safety protection.`;
      } else if (name.includes('extension')) {
        description = `Heavy-duty ${p.name}. Multiple outlets with surge protection for your devices.`;
      } else if (name.includes('otg')) {
        description = `${p.name} adapter. Connect USB devices directly to your smartphone or tablet.`;
      } else if (name.includes('card') || name.includes('leader')) {
        description = `${p.name}. Read and transfer data from memory cards at high speed.`;
      } else if (name.includes('aux')) {
        description = `${p.name} cable. Premium audio connection for speakers, headphones, and car stereos.`;
      } else if (name.includes('staple')) {
        description = `${p.name}. Strong and reliable for binding documents securely.`;
      } else {
        description = `Premium ${p.name}. Quality phone accessory designed for durability and performance.`;
      }
    }

    await prisma.product.update({
      where: { id: p.id },
      data: { description }
    });
  }

  console.log(`Successfully updated ${products.length} product descriptions.`);
};

updateData()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
