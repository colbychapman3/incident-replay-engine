-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "incidentDate" DATE NOT NULL,
    "incidentTime" TIME NOT NULL,
    "sceneType" TEXT NOT NULL,
    "dimensions" JSONB NOT NULL,
    "backgroundImage" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SceneObject" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SceneObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyframe" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "timestamp" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Keyframe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjectState" (
    "id" TEXT NOT NULL,
    "keyframeId" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "position" JSONB NOT NULL,
    "rotation" DOUBLE PRECISION NOT NULL,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObjectState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeHistory" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "SceneObject_projectId_idx" ON "SceneObject"("projectId");

-- CreateIndex
CREATE INDEX "Keyframe_projectId_idx" ON "Keyframe"("projectId");

-- CreateIndex
CREATE INDEX "ObjectState_keyframeId_idx" ON "ObjectState"("keyframeId");

-- CreateIndex
CREATE UNIQUE INDEX "ObjectState_keyframeId_objectId_key" ON "ObjectState"("keyframeId", "objectId");

-- CreateIndex
CREATE INDEX "ChangeHistory_projectId_idx" ON "ChangeHistory"("projectId");

-- CreateIndex
CREATE INDEX "ChangeHistory_timestamp_idx" ON "ChangeHistory"("timestamp");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneObject" ADD CONSTRAINT "SceneObject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyframe" ADD CONSTRAINT "Keyframe_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectState" ADD CONSTRAINT "ObjectState_keyframeId_fkey" FOREIGN KEY ("keyframeId") REFERENCES "Keyframe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectState" ADD CONSTRAINT "ObjectState_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "SceneObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeHistory" ADD CONSTRAINT "ChangeHistory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeHistory" ADD CONSTRAINT "ChangeHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
