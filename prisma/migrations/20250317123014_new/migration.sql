/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.

*/ -- RedefineTables
PRAGMA defer_foreign_keys=ON;

PRAGMA foreign_keys=OFF;

-- drop COLUMN emailVerified from User;
-- drop COLUMN image from User;

alter table User
drop columns emailVerified,
drop image;

PRAGMA defer_foreign_keys=OFF;

