import express from 'express'
import { readdir } from 'fs/promises'
import { resolve, join } from 'path'
import { pathToFileURL } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(express.json())

async function loadRoutes(dir, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      await loadRoutes(fullPath, `${prefix}/${entry.name}`)
    } else if (entry.name.endsWith('.js')) {
      const routeName = entry.name.replace('.js', '')
      const routePath = routeName === 'index' ? prefix || '/' : `${prefix}/${routeName}`
      const mod = await import(pathToFileURL(fullPath).href)
      const handler = mod.default
      if (typeof handler === 'function') {
        app.all(`/api${routePath}`, handler)
        console.log(`  ✓ /api${routePath}`)
      }
    }
  }
}

const apiDir = resolve('./api')
await loadRoutes(apiDir)

app.listen(3000, () => {
  console.log('Backend dev server: http://localhost:3000')
})
