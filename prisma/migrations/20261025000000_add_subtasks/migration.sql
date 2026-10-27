-- CreateTable
CREATE TABLE "Subtask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assignedUser" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "parentTaskId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subtask_parentTaskId_idx" ON "Subtask"("parentTaskId");

-- AddForeignKey
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
