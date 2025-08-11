import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import { EntityManager } from "typeorm"

interface UpdateOrderTagsBody {
  tags?: string[]
  delivery_time?: string
  eta_iso?: string
  eta_label?: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const { tags, delivery_time, eta_iso, eta_label } = req.body as UpdateOrderTagsBody

  try {
    const orderService = req.scope.resolve("orderService")
    const manager: EntityManager = req.scope.resolve("manager")

    await manager.transaction(async (transactionManager) => {
      const updatedMetadata: any = {}
      
      if (tags) updatedMetadata.tags = tags
      if (delivery_time) updatedMetadata.delivery_time = delivery_time
      if (eta_iso) updatedMetadata.eta_iso = eta_iso
      if (eta_label) updatedMetadata.eta_label = eta_label
      
      updatedMetadata.tagged_at = new Date().toISOString()

      await orderService
        .withTransaction(transactionManager)
        .update(id, { metadata: updatedMetadata })
    })

    const order = await orderService.retrieve(id, {
      relations: ["items", "customer", "shipping_address"]
    })

    return res.json({ 
      success: true, 
      order: {
        id: order.id,
        display_id: order.display_id,
        metadata: order.metadata
      }
    })
  } catch (error: any) {
    console.error("Error updating order tags:", error)
    return res.status(500).json({ 
      success: false, 
      error: error?.message || "An error occurred" 
    })
  }
}