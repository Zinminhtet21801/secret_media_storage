const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class initialSchema1664477719807 {
    name = 'initialSchema1664477719807'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "fullName" varchar NOT NULL, "email" varchar NOT NULL, "password" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "media" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL, "userId" integer)`);
        await queryRunner.query(`CREATE TABLE "temporary_media" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL, "userId" integer, CONSTRAINT "FK_0db866835bf356d896e1892635d" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_media"("id", "name", "type", "userId") SELECT "id", "name", "type", "userId" FROM "media"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`ALTER TABLE "temporary_media" RENAME TO "media"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "media" RENAME TO "temporary_media"`);
        await queryRunner.query(`CREATE TABLE "media" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL, "userId" integer)`);
        await queryRunner.query(`INSERT INTO "media"("id", "name", "type", "userId") SELECT "id", "name", "type", "userId" FROM "temporary_media"`);
        await queryRunner.query(`DROP TABLE "temporary_media"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }
}
