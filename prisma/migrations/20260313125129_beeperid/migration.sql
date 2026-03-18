-- AlterTable
CREATE SEQUENCE beeper_id_seq;
ALTER TABLE "Beeper" ALTER COLUMN "id" SET DEFAULT nextval('beeper_id_seq');
ALTER SEQUENCE beeper_id_seq OWNED BY "Beeper"."id";
