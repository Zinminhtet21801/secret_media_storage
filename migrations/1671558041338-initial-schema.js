const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class initialSchema1671558041338 {
    name = 'initialSchema1671558041338'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "fullName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "media" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "mimeType" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_0db866835bf356d896e1892635d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_0db866835bf356d896e1892635d"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }
}
