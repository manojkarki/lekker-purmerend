import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddProductCustomFields1692000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("product", [
      new TableColumn({
        name: "prep_time_hours",
        type: "integer",
        default: 0,
      }),
      new TableColumn({
        name: "same_day_cutoff",
        type: "time",
        default: "'12:00:00'",
      }),
      new TableColumn({
        name: "gallery_images",
        type: "jsonb",
        isNullable: true,
      }),
      new TableColumn({
        name: "estimation_rules",
        type: "text",
        default: "'same_day_if_before_cutoff|next_day'",
      }),
    ])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("product", [
      "prep_time_hours",
      "same_day_cutoff", 
      "gallery_images",
      "estimation_rules",
    ])
  }
}