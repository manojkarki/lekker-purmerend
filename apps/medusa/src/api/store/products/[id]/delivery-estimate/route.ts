import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  try {
    const productService = req.scope.resolve("productService")
    const deliveryEstimationService = req.scope.resolve("deliveryEstimationService")

    const product = await productService.retrieve(id)
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      })
    }

    const estimate = deliveryEstimationService.calculateDeliveryETA(
      product.prep_time_hours || 0,
      product.same_day_cutoff || "12:00"
    )

    return res.json({
      success: true,
      product_id: product.id,
      estimate
    })
  } catch (error: any) {
    console.error("Error calculating delivery estimate:", error)
    return res.status(500).json({ 
      success: false, 
      error: error?.message || "An error occurred" 
    })
  }
}