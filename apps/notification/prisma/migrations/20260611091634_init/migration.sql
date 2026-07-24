-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_updated" TIMESTAMP(3),
    "date_read" TIMESTAMP(3),
    "date_deleted" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notifications_uuid_key" ON "notifications"("uuid");
