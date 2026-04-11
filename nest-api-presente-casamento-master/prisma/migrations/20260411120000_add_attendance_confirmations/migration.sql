-- CreateTable
CREATE TABLE "attendance_confirmations" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "isAttending" BOOLEAN NOT NULL DEFAULT true,
    "companions" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendance_confirmations_email_key" ON "attendance_confirmations"("email");

-- CreateIndex
CREATE INDEX "attendance_confirmations_createdAt_idx" ON "attendance_confirmations"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "attendance_confirmations_isAttending_createdAt_idx" ON "attendance_confirmations"("isAttending", "createdAt" DESC);
