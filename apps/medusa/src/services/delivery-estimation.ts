import { TransactionBaseService } from "@medusajs/medusa"
import { calculateETA, isPurmerend } from "@lekker/utils"
import { DeliveryEstimate, PurmerendDetection } from "@lekker/shared-types"

class DeliveryEstimationService extends TransactionBaseService {
  
  calculateDeliveryETA(prepTimeHours: number, cutoffTime: string): DeliveryEstimate {
    return calculateETA(prepTimeHours, cutoffTime);
  }

  detectPurmerend(city?: string, postalCode?: string): PurmerendDetection {
    return isPurmerend(city, postalCode);
  }

  getAvailablePaymentMethods(isPurmerend: boolean, isDelivery: boolean): string[] {
    const baseMethods = ["stripe", "manual"];
    
    if (isPurmerend && isDelivery) {
      baseMethods.push("cash_on_delivery");
    }
    
    return baseMethods;
  }

  getShippingOptions(address: any): Array<{ id: string; name: string; amount: number }> {
    const { city, postal_code } = address;
    const { isPurmerend } = this.detectPurmerend(city, postal_code);
    
    const options = [
      {
        id: "pickup",
        name: "Ophalen",
        amount: 0
      }
    ];

    if (isPurmerend) {
      options.push({
        id: "delivery",
        name: "Bezorgen (gratis in Purmerend)",
        amount: 0
      });
    }

    return options;
  }
}

export default DeliveryEstimationService