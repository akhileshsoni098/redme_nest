import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool
  private dbInstance!: ReturnType<typeof drizzle<typeof schema>>

  async onModuleInit() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set in .env file')
    }

    // Auto-create database if not exists
    const dbNameMatch = connectionString.match(/\/([^/]+)$/)
    if (dbNameMatch) {
      const dbName = dbNameMatch[1]
      const baseUrl = connectionString.replace(`/${dbName}`, '/postgres')
      const tempPool = new Pool({ connectionString: baseUrl })
      try {
        const result = await tempPool.query(
          `SELECT 1 FROM pg_database WHERE datname = $1`,
          [dbName],
        )
        if (result.rowCount === 0) {
          await tempPool.query(`CREATE DATABASE "${dbName}"`)
          console.log(`✅ Database "${dbName}" created successfully`)
        }
      } finally {
        await tempPool.end()
      }
    }

    this.pool = new Pool({ connectionString })
    this.dbInstance = drizzle(this.pool, { schema })
    console.log('✅ Database connected successfully')
  }

  get db() {
    return this.dbInstance
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end()
      console.log('🔌 Database connection closed')
    }
  }
}