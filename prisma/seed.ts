// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Empezando el seeding...')
  
  // 1. Limpiamos la base de datos para empezar de cero
  await prisma.product.deleteMany()
  
  // 2. Insertamos la Lasaña
  await prisma.product.create({
    data: {
      name: 'Lasaña de Espinacas',
      description: 'Nuestra especialidad para el frío. Gratinado perfecto.',
      price: 12.50,
      image_url: '/img/lasana.jpg',
      stock: 10,
      category: 'principal'
    },
  })
  
  // 3. Insertamos las Croquetas (¡Ahora sí!)
  await prisma.product.create({
    data: {
      name: 'Croquetas de Boletus',
      description: 'Cremosas por dentro, crujientes por fuera. Pack de 6.',
      price: 8.00,
      image_url: '/img/croquetas.jpg',
      stock: 25,
      category: 'entrante'
    },
  })

  // 4. Insertamos la Costilla
  await prisma.product.create({
    data: {
      name: 'Costilla BBQ',
      description: 'Se deshace sola. Cocinada 12 horas a baja temperatura.',
      price: 18.90,
      image_url: '/img/costilla.jpg',
      stock: 5,
      category: 'principal'
    },
  })

  console.log('✅ Seeding completado: 3 platos creados.')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })