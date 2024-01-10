-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "mobileNumber" TEXT NOT NULL,
    "couponCount" TEXT NOT NULL,
    "screenShot" BYTEA,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
