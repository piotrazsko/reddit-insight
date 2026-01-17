-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "openaiKey" TEXT,
    "reportSections" TEXT,
    "aiProvider" TEXT NOT NULL DEFAULT 'openai',
    "ollamaUrl" TEXT DEFAULT 'http://localhost:11434',
    "ollamaModel" TEXT DEFAULT 'llama3',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "openaiKey", "password", "reportSections") SELECT "createdAt", "email", "id", "name", "openaiKey", "password", "reportSections" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
