import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function seed() {
  // Create default admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await db.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    },
  })
  
  // Create employee account
  const employeePassword = await bcrypt.hash('employee123', 10)
  await db.admin.upsert({
    where: { username: 'employee' },
    update: {},
    create: {
      username: 'employee',
      password: employeePassword,
      name: 'Hotel Staff',
      role: 'employee',
    },
  })

  // Seed inventory items
  const inventoryItems = [
    // Cleaning
    { name: 'Soap', nameSo: 'Sabuun', category: 'cleaning', quantity: 50, unit: 'pieces', minQuantity: 10, costPerUnit: 0.50, supplier: 'Kabridahar Market' },
    { name: 'Detergent', nameSo: 'Dhaqamey', category: 'cleaning', quantity: 15, unit: 'kg', minQuantity: 5, costPerUnit: 3.00, supplier: 'Kabridahar Market' },
    { name: 'Bleach', nameSo: 'Bliish', category: 'cleaning', quantity: 8, unit: 'liters', minQuantity: 3, costPerUnit: 2.50, supplier: 'Kabridahar Market' },
    { name: 'Floor Cleaner', nameSo: 'Nadiifinta Dhambaalka', category: 'cleaning', quantity: 12, unit: 'liters', minQuantity: 4, costPerUnit: 4.00, supplier: 'Kabridahar Market' },
    { name: 'Toilet Paper', nameSo: 'Warqad Daryeelka', category: 'cleaning', quantity: 30, unit: 'rolls', minQuantity: 10, costPerUnit: 1.20, supplier: 'Kabridahar Market' },
    // Food
    { name: 'Canjeero Flour', nameSo: 'Bur (Unsplash)', category: 'food', quantity: 25, unit: 'kg', minQuantity: 8, costPerUnit: 1.80, supplier: 'Local Mills' },
    { name: 'Sugar', nameSo: 'Sonkor', category: 'food', quantity: 20, unit: 'kg', minQuantity: 5, costPerUnit: 2.00, supplier: 'Kabridahar Market' },
    { name: 'Tea Leaves', nameSo: 'Shah', category: 'food', quantity: 6, unit: 'kg', minQuantity: 3, costPerUnit: 8.00, supplier: 'Ethiopian Tea Import' },
    { name: 'Coffee', nameSo: 'Bun', category: 'food', quantity: 5, unit: 'kg', minQuantity: 2, costPerUnit: 12.00, supplier: 'Local Coffee Farm' },
    { name: 'Eggs', nameSo: 'Ulo', category: 'food', quantity: 60, unit: 'pieces', minQuantity: 20, costPerUnit: 0.15, supplier: 'Local Farm' },
    { name: 'Cooking Oil', nameSo: 'Saliid', category: 'food', quantity: 10, unit: 'liters', minQuantity: 4, costPerUnit: 3.50, supplier: 'Kabridahar Market' },
    // Beverages
    { name: 'Water Bottles', nameSo: 'Biyo Aan Xirmooyinka Ka Bixin', category: 'beverages', quantity: 100, unit: 'bottles', minQuantity: 30, costPerUnit: 0.30, supplier: 'Bottled Water Co.' },
    { name: 'Pepsi Cans', nameSo: 'Pepsi Can', category: 'beverages', quantity: 48, unit: 'pieces', minQuantity: 12, costPerUnit: 0.60, supplier: 'Distributor' },
    { name: 'Mango Juice', nameSo: 'Jusi Macaan', category: 'beverages', quantity: 24, unit: 'packs', minQuantity: 8, costPerUnit: 1.50, supplier: 'Juice Factory' },
    { name: 'Fresh Milk', nameSo: 'Caano Cusub', category: 'beverages', quantity: 15, unit: 'liters', minQuantity: 5, costPerUnit: 2.00, supplier: 'Local Dairy' },
    // Bedding
    { name: 'Bedsheets', nameSo: 'Shaqalka Qolka', category: 'bedding', quantity: 20, unit: 'sets', minQuantity: 6, costPerUnit: 15.00, supplier: 'Textile Shop' },
    { name: 'Pillow Cases', nameSo: 'Gacan Buuxinta Masar', category: 'bedding', quantity: 30, unit: 'pieces', minQuantity: 10, costPerUnit: 3.00, supplier: 'Textile Shop' },
    { name: 'Blankets', nameSo: 'Boordo', category: 'bedding', quantity: 15, unit: 'pieces', minQuantity: 5, costPerUnit: 20.00, supplier: 'Textile Shop' },
    { name: 'Towels', nameSo: 'Dharka Qoyinta', category: 'bedding', quantity: 25, unit: 'pieces', minQuantity: 8, costPerUnit: 5.00, supplier: 'Textile Shop' },
    // Amenities
    { name: 'Soap Bars', nameSo: 'Sabuun Yar', category: 'amenities', quantity: 40, unit: 'pieces', minQuantity: 15, costPerUnit: 0.80, supplier: 'Kabridahar Market' },
    { name: 'Shampoo Bottles', nameSo: 'Shambu', category: 'amenities', quantity: 20, unit: 'bottles', minQuantity: 8, costPerUnit: 2.50, supplier: 'Kabridahar Market' },
    { name: 'Toothpaste', nameSo: 'Fuuqa Ilkaha', category: 'amenities', quantity: 30, unit: 'pieces', minQuantity: 10, costPerUnit: 1.00, supplier: 'Kabridahar Market' },
    { name: 'Tissue Boxes', nameSo: 'Bakhska Dargida', category: 'amenities', quantity: 18, unit: 'boxes', minQuantity: 6, costPerUnit: 0.75, supplier: 'Kabridahar Market' },
    // Maintenance
    { name: 'Light Bulbs', nameSo: 'Lamba', category: 'maintenance', quantity: 12, unit: 'pieces', minQuantity: 4, costPerUnit: 1.50, supplier: 'Hardware Store' },
    { name: 'AC Filters', nameSo: 'Filteerka Hoose', category: 'maintenance', quantity: 4, unit: 'pieces', minQuantity: 2, costPerUnit: 8.00, supplier: 'HVAC Supplier' },
    { name: 'Paint Buckets', nameSo: 'Rag Buundo', category: 'maintenance', quantity: 3, unit: 'buckets', minQuantity: 2, costPerUnit: 15.00, supplier: 'Paint Shop' },
  ]

  for (const item of inventoryItems) {
    await db.inventoryItem.upsert({
      where: { id: `${item.category}-${item.name.toLowerCase().replace(/\s/g, '-')}` },
      update: {},
      create: {
        id: `${item.category}-${item.name.toLowerCase().replace(/\s/g, '-')}`,
        ...item,
        lastRestocked: new Date(),
      },
    })
  }

  // Seed payment settings
  const paymentSettings = [
    { key: 'payment.bank1_name', value: 'Commercial Bank of Ethiopia', valueSo: 'Bangiga Ganacsiga ee Itoobiya' },
    { key: 'payment.bank1_nameSo', value: 'Bangiga Ganacsiga ee Itoobiya', valueSo: 'Bangiga Ganacsiga ee Itoobiya' },
    { key: 'payment.bank1_account', value: '1000123456789', valueSo: '1000123456789' },
    { key: 'payment.bank1_holder', value: 'Gaboose Hotel', valueSo: 'Gaboose Hotel' },
    { key: 'payment.bank1_holderSo', value: 'Gaboose Hotel', valueSo: 'Gaboose Hotel' },
    { key: 'payment.bank2_name', value: 'Telebirr', valueSo: 'Telebirr' },
    { key: 'payment.bank2_nameSo', value: 'Telebirr', valueSo: 'Telebirr' },
    { key: 'payment.bank2_account', value: '0915210607', valueSo: '0915210607' },
    { key: 'payment.bank2_holder', value: 'Gaboose Hotel', valueSo: 'Gaboose Hotel' },
    { key: 'payment.bank2_holderSo', value: 'Gaboose Hotel', valueSo: 'Gaboose Hotel' },
    { key: 'payment.instructions', value: 'Send the full amount to any of the accounts below, then upload a screenshot of your payment receipt. Your booking will be confirmed once payment is verified.', valueSo: 'Dhig lacagta oo dhamaystiran si kastaba ha ahaatee accountka hoose, kadibna soo geli sawirka waraaqaha lacag bixinta. Dalabkaaga waa la xaqiiji doonaa marka lacag bixinta la verify gareeyo.' },
    { key: 'payment.instructionsSo', value: 'Dhig lacagta oo dhamaystiran si kastaba ha ahaatee accountka hoose, kadibna soo geli sawirka waraaqaha lacag bixinta. Dalabkaaga waa la xaqiiji doonaa marka lacag bixinta la verify gareeyo.', valueSo: 'Dhig lacagta oo dhamaystiran si kastaba ha ahaatee accountka hoose, kadibna soo geli sawirka waraaqaha lacag bixinta. Dalabkaaga waa la xaqiiji doonaa marka lacag bixinta la verify gareeyo.' },
  ]

  for (const setting of paymentSettings) {
    await db.siteContent.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('Seeded admin users, inventory items, and payment settings')
}

seed().catch(console.error).finally(() => db.$disconnect())
