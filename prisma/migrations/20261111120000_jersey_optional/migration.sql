-- Jersey numbers are optional (a roster spot no longer needs one).
ALTER TABLE "PlayerSeason" ALTER COLUMN "jerseyNumber" DROP NOT NULL;
