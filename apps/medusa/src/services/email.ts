import { TransactionBaseService, Order } from "@medusajs/medusa"
import nodemailer from "nodemailer"
import { EmailTemplate } from "@lekker/shared-types"

class EmailService extends TransactionBaseService {
  private transporter: nodemailer.Transporter

  constructor(container) {
    super(container)
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendOrderConfirmation(order: Order): Promise<void> {
    const customer = order.customer
    const items = order.items.map(item => ({
      title: item.title,
      quantity: item.quantity,
      price: (item.unit_price / 100).toFixed(2)
    }))

    const total = (order.total / 100).toFixed(2)
    const deliveryMethod = order.shipping_methods?.[0]?.shipping_option?.name || "Ophalen"
    const isDelivery = deliveryMethod.toLowerCase().includes("bezorg")
    
    const etaLabel = order.metadata?.eta_label || "Binnenkort"
    const etaRange = order.metadata?.eta_range || ""

    const template: EmailTemplate = {
      to: customer?.email || order.email,
      subject: `Bestelling bevestiging - #${order.display_id}`,
      html: this.generateOrderConfirmationHTML({
        customerName: `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim(),
        orderId: order.display_id,
        items,
        total,
        deliveryMethod,
        isDelivery,
        etaLabel,
        etaRange,
        pickupAddress: "Lekker Purmerend\nHuidenstraat 123\n1441 HZ Purmerend",
        deliveryAddress: isDelivery ? this.formatAddress(order.shipping_address) : undefined
      })
    }

    await this.sendEmail(template)
  }

  async sendOwnerNotification(order: Order): Promise<void> {
    const template: EmailTemplate = {
      to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
      subject: `Nieuwe bestelling - #${order.display_id}`,
      html: this.generateOwnerNotificationHTML(order)
    }

    await this.sendEmail(template)
  }

  private async sendEmail(template: EmailTemplate): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Lekker Purmerend" <${process.env.SMTP_USER}>`,
        ...template
      })
    } catch (error) {
      console.error("Failed to send email:", error)
      throw error
    }
  }

  private generateOrderConfirmationHTML(data: any): string {
    return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bedankt voor je bestelling!</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .order-info { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .items-table th { background: #f3f4f6; font-weight: 600; }
    .total-row { font-weight: 600; background: #f9fafb; }
    .highlight { color: #2563eb; font-weight: 600; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bedankt voor je bestelling!</h1>
      <p>We gaan er direct mee aan de slag 🍰</p>
    </div>
    <div class="content">
      <p>Beste ${data.customerName || 'klant'},</p>
      <p>We hebben je bestelling ontvangen en bereiden alles vers voor je voor.</p>
      
      <div class="order-info">
        <h3>📋 Bestelgegevens</h3>
        <p><strong>Bestelnummer:</strong> <span class="highlight">#${data.orderId}</span></p>
        <p><strong>Klaar voor:</strong> <span class="highlight">${data.etaLabel} ${data.etaRange}</span></p>
        <p><strong>Methode:</strong> ${data.deliveryMethod}</p>
        ${data.isDelivery ? 
          `<p><strong>Bezorgadres:</strong><br>${data.deliveryAddress}</p>` :
          `<p><strong>Ophaaladres:</strong><br>${data.pickupAddress}</p>`
        }
      </div>
      
      <h3>🛒 Je bestelling</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Aantal</th>
            <th>Prijs</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
          <tr>
            <td>${item.title}</td>
            <td>${item.quantity}</td>
            <td>€${item.price}</td>
          </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="2"><strong>Totaal</strong></td>
            <td><strong>€${data.total}</strong></td>
          </tr>
        </tfoot>
      </table>
      
      <div class="footer">
        <p>Heb je vragen? Neem gerust contact met ons op!</p>
        <p><strong>Lekker Purmerend</strong> | info@lekkerpurmerend.nl</p>
      </div>
    </div>
  </div>
</body>
</html>`
  }

  private generateOwnerNotificationHTML(order: Order): string {
    const items = order.items.map(item => ({
      title: item.title,
      quantity: item.quantity,
      price: (item.unit_price / 100).toFixed(2),
      notes: item.metadata?.notes || ''
    }))

    return `
<h2>Nieuwe bestelling ontvangen! 🎉</h2>
<p><strong>Bestelnummer:</strong> #${order.display_id}</p>
<p><strong>Klant:</strong> ${order.customer?.first_name} ${order.customer?.last_name} (${order.email})</p>
<p><strong>Telefoon:</strong> ${order.shipping_address?.phone || 'Niet opgegeven'}</p>
<p><strong>ETA:</strong> ${order.metadata?.eta_label} ${order.metadata?.eta_range}</p>

<h3>Items:</h3>
<ul>
${items.map(item => `<li>${item.quantity}x ${item.title} ${item.notes ? `(${item.notes})` : ''}</li>`).join('')}
</ul>

<p><strong>Totaal:</strong> €${(order.total / 100).toFixed(2)}</p>
<p><strong>Print link:</strong> <a href="${process.env.SITE_URL}/orders/${order.id}/print">Bestelbon printen</a></p>
`
  }

  private formatAddress(address: any): string {
    if (!address) return ''
    
    return [
      address.address_1,
      address.address_2,
      `${address.postal_code} ${address.city}`,
      address.country_code?.toUpperCase()
    ].filter(Boolean).join('<br>')
  }
}

export default EmailService