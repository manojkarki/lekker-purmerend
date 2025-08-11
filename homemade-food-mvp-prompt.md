# Homemade Food E-commerce - Complete Implementation Guide

## Project Overview
Build a Dutch-language, mobile-first e-commerce platform for homemade food (cakes, cookies, snacks) with local delivery management and integrated blog. Self-hosted on VPS using open-source frameworks.

---

## Phase 1: Project Structure & Initial Setup

### Directory Structure
```
homemade-food/
├── apps/
│   ├── medusa/          # E-commerce backend
│   ├── strapi/          # CMS backend
│   └── web/             # Next.js frontend
├── packages/
│   ├── shared-types/    # TypeScript types
│   └── utils/           # Shared utilities
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   └── docker-compose.prod.yml
│   └── nginx/
│       └── sites-available/
├── scripts/
│   ├── setup.sh         # Initial setup script
│   └── seed.js          # Database seeding
├── .env.example
├── .env.local
├── pnpm-workspace.yaml
└── README.md
```

### Initialize Monorepo
```bash
# Create workspace configuration
echo "packages:
  - 'apps/*'
  - 'packages/*'" > pnpm-workspace.yaml

# Initialize root package.json
{
  "name": "homemade-food",
  "private": true,
  "scripts": {
    "dev": "docker-compose up -d && pnpm --parallel dev",
    "build": "pnpm --recursive build",
    "setup": "bash scripts/setup.sh",
    "seed": "node scripts/seed.js"
  }
}
```

---

## Phase 2: Backend Implementation

### Medusa Setup & Extensions

#### 1. Initialize Medusa
```bash
cd apps/medusa
npx create-medusa-app@latest . --skip-db
```

#### 2. Create Custom Product Entity Extension
```typescript
// apps/medusa/src/models/product.ts
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
}
```

#### 3. Delivery Logic Service
```typescript
// apps/medusa/src/services/delivery-estimation.ts
import { TransactionBaseService } from "@medusajs/medusa"
import { format, addHours, isAfter, parse, addDays } from "date-fns"
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz"

class DeliveryEstimationService extends TransactionBaseService {
  private timezone = "Europe/Amsterdam"
  
  calculateETA(prepTimeHours: number, cutoffTime: string): {
    eta_iso: string
    eta_label: string
    eta_range: string
  } {
    const now = utcToZonedTime(new Date(), this.timezone)
    const cutoff = parse(cutoffTime, "HH:mm", now)
    
    let baseDate = now
    if (isAfter(now, cutoff)) {
      baseDate = addDays(now, 1)
    }
    
    const eta = addHours(baseDate, prepTimeHours)
    
    return {
      eta_iso: eta.toISOString(),
      eta_label: this.getLabel(eta, now),
      eta_range: this.getTimeRange(eta)
    }
  }
  
  private getLabel(eta: Date, now: Date): string {
    const etaDate = format(eta, "yyyy-MM-dd")
    const todayDate = format(now, "yyyy-MM-dd")
    const tomorrowDate = format(addDays(now, 1), "yyyy-MM-dd")
    
    if (etaDate === todayDate) return "Vandaag"
    if (etaDate === tomorrowDate) return "Morgen"
    return format(eta, "EEEE d MMMM", { locale: nl })
  }
  
  private getTimeRange(eta: Date): string {
    const startHour = eta.getHours()
    const endHour = Math.min(startHour + 3, 21)
    return `${startHour}:00–${endHour}:00`
  }
}

export default DeliveryEstimationService
```

#### 4. Payment & Shipping Strategy
```typescript
// apps/medusa/src/strategies/purmerend-shipping.ts
import { FulfillmentService } from "@medusajs/medusa"

class PurmerendShippingStrategy extends FulfillmentService {
  static identifier = "purmerend-delivery"
  
  private purmerendPostalCodes = ["1441", "1442", "1443", "1444", "1445", "1446", "1447", "1448"]
  
  async canCalculate(data: { shipping_address: any }): Promise<boolean> {
    const { city, postal_code } = data.shipping_address
    return this.isPurmerend(city, postal_code)
  }
  
  private isPurmerend(city: string, postalCode: string): boolean {
    if (city?.toLowerCase() === "purmerend") return true
    if (postalCode) {
      const prefix = postalCode.substring(0, 4)
      return this.purmerendPostalCodes.includes(prefix)
    }
    return false
  }
  
  async calculatePrice(): Promise<number> {
    return 0 // Free delivery in Purmerend
  }
}
```

#### 5. Order Management API
```typescript
// apps/medusa/src/api/admin/orders/[id]/tags/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const { tags, delivery_time } = req.body
  
  const orderService = req.scope.resolve("orderService")
  
  await orderService.update(id, {
    metadata: {
      tags,
      delivery_time,
      tagged_at: new Date().toISOString()
    }
  })
  
  return res.json({ success: true })
}
```

### Strapi CMS Setup

#### 1. Initialize Strapi
```bash
cd apps/strapi
npx create-strapi-app@latest . --quickstart --no-run
```

#### 2. Blog Post Content Type
```javascript
// apps/strapi/src/api/post/content-types/post/schema.json
{
  "kind": "collectionType",
  "collectionName": "posts",
  "info": {
    "singularName": "post",
    "pluralName": "posts",
    "displayName": "Blog Post"
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true
    },
    "content": {
      "type": "richtext",
      "required": true
    },
    "excerpt": {
      "type": "text",
      "maxLength": 200
    },
    "coverImage": {
      "type": "media",
      "multiple": false,
      "required": false,
      "allowedTypes": ["images"]
    },
    "seo": {
      "type": "component",
      "repeatable": false,
      "component": "shared.seo"
    },
    "publishedAt": {
      "type": "datetime"
    }
  }
}
```

---

## Phase 3: Frontend Implementation

### Next.js Application Structure

#### 1. Initialize Next.js with TypeScript
```bash
cd apps/web
npx create-next-app@latest . --typescript --tailwind --app --use-pnpm
```

#### 2. Core Components

```typescript
// apps/web/components/DeliveryEstimate.tsx
import { Product } from "@/types"
import { calculateETA } from "@/lib/delivery"

export function DeliveryEstimate({ product }: { product: Product }) {
  const { eta_label, eta_range } = calculateETA(
    product.prep_time_hours,
    product.same_day_cutoff
  )
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-green-600">...</svg>
        <span className="text-sm font-medium text-green-900">
          Levering: {eta_label} {eta_range}
        </span>
      </div>
    </div>
  )
}
```

```typescript
// apps/web/components/PaymentMethodSelector.tsx
interface PaymentMethodSelectorProps {
  isPurmerend: boolean
  isDelivery: boolean
  onChange: (method: string) => void
}

export function PaymentMethodSelector({ 
  isPurmerend, 
  isDelivery, 
  onChange 
}: PaymentMethodSelectorProps) {
  const availableMethods = [
    { id: "ideal", label: "iDEAL", available: true },
    { id: "card", label: "Creditcard", available: true },
    { id: "bank", label: "Bankoverschrijving", available: true },
    { id: "cod", label: "Contant bij levering", available: isPurmerend && isDelivery }
  ]
  
  return (
    <div className="space-y-3">
      {availableMethods.map(method => (
        <label 
          key={method.id}
          className={`flex items-center p-4 border rounded-lg cursor-pointer
            ${!method.available ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
        >
          <input
            type="radio"
            name="payment"
            value={method.id}
            disabled={!method.available}
            onChange={(e) => onChange(e.target.value)}
            className="mr-3"
          />
          <span>{method.label}</span>
        </label>
      ))}
    </div>
  )
}
```

#### 3. Product Gallery Component
```typescript
// apps/web/components/ProductGallery.tsx
"use client"
import { useState } from "react"
import Image from "next/image"

export function ProductGallery({ images }: { images: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  return (
    <div className="space-y-4">
      <div className="aspect-square relative overflow-hidden rounded-lg">
        <Image
          src={images[selectedIndex]}
          alt="Product"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={`aspect-square relative rounded-md overflow-hidden border-2
              ${idx === selectedIndex ? 'border-blue-500' : 'border-gray-200'}`}
          >
            <Image src={image} alt="" fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
```

#### 4. Blog Product Embed Parser
```typescript
// apps/web/lib/blog-parser.tsx
import { ProductCard } from "@/components/ProductCard"

export async function parseContent(content: string): Promise<JSX.Element[]> {
  const parts = content.split(/(\[product:[\w-]+\])/g)
  
  return Promise.all(parts.map(async (part) => {
    const match = part.match(/\[product:([\w-]+)\]/)
    if (match) {
      const handle = match[1]
      const product = await fetchProduct(handle)
      return <ProductCard key={handle} product={product} />
    }
    return <div key={part} dangerouslySetInnerHTML={{ __html: part }} />
  }))
}
```

---

## Phase 4: Infrastructure & Deployment

### Docker Compose Configuration
```yaml
# infra/docker/docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: medusa
      POSTGRES_PASSWORD: medusa
      POSTGRES_DB: medusa
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  medusa:
    build: ../../apps/medusa
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://medusa:medusa@postgres:5432/medusa
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your-secret
      COOKIE_SECRET: your-secret
    ports:
      - "9000:9000"
    volumes:
      - ../../apps/medusa:/app
      - /app/node_modules

  strapi:
    build: ../../apps/strapi
    depends_on:
      - postgres
    environment:
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: strapi
      DATABASE_USERNAME: medusa
      DATABASE_PASSWORD: medusa
    ports:
      - "1337:1337"
    volumes:
      - ../../apps/strapi:/app
      - /app/node_modules
      - strapi_uploads:/app/public/uploads

volumes:
  postgres_data:
  strapi_uploads:
```

### Email Templates
```html
<!-- apps/medusa/data/templates/order-confirmation.html -->
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <style>
    .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .order-info { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .items-table { width: 100%; border-collapse: collapse; }
    .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bedankt voor je bestelling!</h1>
    </div>
    <div class="content">
      <p>Beste {{customer_name}},</p>
      <p>We hebben je bestelling ontvangen en gaan er direct mee aan de slag.</p>
      
      <div class="order-info">
        <h3>Bestelgegevens</h3>
        <p><strong>Bestelnummer:</strong> {{order_id}}</p>
        <p><strong>Levering:</strong> {{eta_label}} {{eta_range}}</p>
        <p><strong>Methode:</strong> {{delivery_method}}</p>
        {{#if is_delivery}}
        <p><strong>Adres:</strong> {{delivery_address}}</p>
        {{else}}
        <p><strong>Ophaaladres:</strong> {{pickup_address}}</p>
        {{/if}}
      </div>
      
      <h3>Je bestelling</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Aantal</th>
            <th>Prijs</th>
          </tr>
        </thead>
        <tbody>
          {{#each items}}
          <tr>
            <td>{{title}}</td>
            <td>{{quantity}}</td>
            <td>€{{price}}</td>
          </tr>
          {{/each}}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2"><strong>Totaal</strong></td>
            <td><strong>€{{total}}</strong></td>
          </tr>
        </tfoot>
      </table>
      
      <p>Heb je vragen? Neem gerust contact met ons op!</p>
    </div>
  </div>
</body>
</html>
```

---

## Phase 5: Testing & Quality Assurance

### Test Scenarios
```typescript
// apps/web/__tests__/delivery.test.ts
import { calculateETA } from "@/lib/delivery"

describe("Delivery Estimation", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  
  test("Before cutoff - same day delivery", () => {
    jest.setSystemTime(new Date("2024-01-15 10:00:00"))
    const result = calculateETA(6, "12:00")
    expect(result.eta_label).toBe("Vandaag")
    expect(result.eta_range).toBe("16:00–19:00")
  })
  
  test("After cutoff - next day delivery", () => {
    jest.setSystemTime(new Date("2024-01-15 14:00:00"))
    const result = calculateETA(6, "12:00")
    expect(result.eta_label).toBe("Morgen")
  })
  
  test("Purmerend detection", () => {
    expect(isPurmerend("Purmerend", "1441AA")).toBe(true)
    expect(isPurmerend("purmerend", "1441AA")).toBe(true)
    expect(isPurmerend("Amsterdam", "1012AA")).toBe(false)
  })
})
```

### Database Seeding Script
```javascript
// scripts/seed.js
const { createClient } = require('@medusajs/medusa-js')

async function seed() {
  const client = createClient({ baseUrl: 'http://localhost:9000' })
  
  // Create test products
  const products = [
    {
      title: "Chocolade Taart",
      handle: "chocolade-taart",
      description: "Rijke chocoladetaart met ganache",
      metadata: {
        prep_time_hours: 4,
        same_day_cutoff: "12:00",
        gallery_images: ["/images/choco1.jpg", "/images/choco2.jpg"]
      },
      variants: [{ title: "Klein (6 pers)", prices: [{ amount: 2500, currency_code: "EUR" }] }]
    },
    {
      title: "Appeltaart",
      handle: "appeltaart",
      description: "Klassieke Nederlandse appeltaart",
      metadata: {
        prep_time_hours: 3,
        same_day_cutoff: "14:00"
      },
      variants: [{ title: "Standaard", prices: [{ amount: 1800, currency_code: "EUR" }] }]
    }
  ]
  
  for (const product of products) {
    await client.admin.products.create(product)
  }
  
  console.log("✅ Seeding complete")
}

seed().catch(console.error)
```

---

## Phase 6: Production Deployment

### VPS Setup Script
```bash
#!/bin/bash
# scripts/deploy-vps.sh

# Create application directories
mkdir -p /opt/homemade-food/{medusa,strapi,web}
mkdir -p /var/log/homemade-food

# Setup PostgreSQL databases
sudo -u postgres psql <<EOF
CREATE DATABASE medusa_prod;
CREATE DATABASE strapi_prod;
CREATE USER app_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE medusa_prod TO app_user;
GRANT ALL PRIVILEGES ON DATABASE strapi_prod TO app_user;
EOF

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Setup systemd services
cat > /etc/systemd/system/medusa.service <<EOF
[Unit]
Description=Medusa Backend
After=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/homemade-food/medusa
ExecStart=/usr/bin/node index.js
Restart=on-failure
Environment="NODE_ENV=production"
Environment="DATABASE_URL=postgresql://app_user:secure_password@localhost:5432/medusa_prod"

[Install]
WantedBy=multi-user.target
EOF

# Nginx configuration
cat > /etc/nginx/sites-available/homemade-food <<EOF
upstream medusa {
    server 127.0.0.1:9000;
}

upstream strapi {
    server 127.0.0.1:1337;
}

upstream nextjs {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.nl;
    
    location /api {
        proxy_pass http://medusa;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    
    location /admin {
        proxy_pass http://strapi;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    
    location / {
        proxy_pass http://nextjs;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Enable services
systemctl enable medusa
systemctl enable strapi
systemctl enable nextjs
systemctl start medusa strapi nextjs
```

---

## Implementation Checklist

### Week 1: Foundation
- [ ] Setup monorepo structure
- [ ] Initialize Medusa with custom fields
- [ ] Create Strapi blog content type
- [ ] Setup Docker Compose
- [ ] Implement delivery estimation logic

### Week 2: Core Features  
- [ ] Build payment method matrix
- [ ] Create order management APIs
- [ ] Implement email templates
- [ ] Build product gallery component
- [ ] Create checkout flow with Purmerend detection

### Week 3: Frontend & Integration
- [ ] Complete all frontend pages
- [ ] Implement blog with product embeds
- [ ] Add SEO components
- [ ] Create print-friendly order sheets
- [ ] Setup Stripe integration

### Week 4: Testing & Deployment
- [ ] Write integration tests
- [ ] Seed test data
- [ ] Setup VPS environment
- [ ] Deploy with Nginx reverse proxy
- [ ] Perform production smoke tests

---

## Critical Success Factors

1. **Data Integrity**: All times in Europe/Amsterdam timezone
2. **Payment Security**: Stripe test mode first, validate all flows
3. **Mobile Performance**: Test on real devices, optimize images
4. **Dutch Localization**: All UI text, emails, and errors in Dutch
5. **Order Accuracy**: Double-check ETA calculations and delivery rules

---

## Support & Troubleshooting

### Common Issues & Solutions

**PostgreSQL Connection Issues**
```bash
# Check if PostgreSQL is running
docker-compose ps
# View logs
docker-compose logs postgres
```

**Medusa Admin Not Loading**
```bash
# Rebuild admin UI
cd apps/medusa
pnpm run build:admin
```

**Stripe Webhooks Not Working Locally**
```bash
# Use Stripe CLI for local testing
stripe listen --forward-to localhost:9000/stripe/hooks
```

**Email Not Sending**
- Verify SMTP credentials in .env
- Check firewall rules for SMTP port
- Test with console.log email transport first

---

## Next Steps After MVP

1. **Analytics**: Add Plausible or Umami for privacy-friendly analytics
2. **Reviews**: Customer review system with moderation
3. **Loyalty**: Points system for repeat customers  
4. **Inventory**: Real-time stock management
5. **Multi-language**: Add English support
6. **PWA**: Convert to Progressive Web App for mobile