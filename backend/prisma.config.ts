import { defineConfig } from 'prisma'

export default defineConfig({
  seed: 'node --import tsx prisma/seed.ts'
})
