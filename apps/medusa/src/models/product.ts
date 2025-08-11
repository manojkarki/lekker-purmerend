import { Column, Entity } from "typeorm"
import { Product as MedusaProduct } from "@medusajs/medusa"

@Entity()
export class Product extends MedusaProduct {
  @Column({ type: "int", default: 0 })
  prep_time_hours: number

  @Column({ type: "time", default: "12:00:00" })
  same_day_cutoff: string

  @Column({ type: "jsonb", nullable: true })
  gallery_images: string[]

  @Column({ type: "text", default: "same_day_if_before_cutoff|next_day" })
  estimation_rules: string
}