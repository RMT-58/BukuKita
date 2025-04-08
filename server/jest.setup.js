import { connectToTestDatabase, disconnectFromTestDatabase, clearDatabase } from "./test-utils.js"

// Global variables to store database connection
let client
let db

/**
 * Set up the database before running tests
 */
export async function setupDatabase() {
  // Connect to the test database
  const connection = await connectToTestDatabase()
  client = connection.client
  db = connection.db

  // Clear all collections
  await clearDatabase(db)

  // Return the database for use in tests
  return db
}

/**
 * Tear down the database after running tests
 */
export async function teardownDatabase() {
  // Clear all collections
  if (db) {
    await clearDatabase(db)
  }

  // Disconnect from the database
  await disconnectFromTestDatabase()
  client = null
  db = null
}

// Set up global beforeAll and afterAll hooks
global.beforeAll(async () => {
  await setupDatabase()
})

global.afterAll(async () => {
  await teardownDatabase()
})

