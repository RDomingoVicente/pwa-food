// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

  console.log('🛠️ Aplicando permisos de base de datos...')
  
  // 1. 👇 AÑADE ESTO: Permisos para que Vercel/Supabase no se quejen de las secuencias (IDs)
  try {
    await prisma.$executeRawUnsafe(`GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;`)
    await prisma.$executeRawUnsafe(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;`)
    await prisma.$executeRawUnsafe(`GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;`)
    console.log('✅ Permisos aplicados correctamente')
  } catch (e) {
    console.warn('⚠️ Aviso al aplicar permisos (puede que ya estén puestos):', e)
  }
  
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