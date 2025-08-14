'use client'

import { RadioGroup } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { BanknotesIcon } from '@heroicons/react/24/outline'
import { PaymentMethod } from '@lekker/shared-types'

interface PaymentMethodSelectorProps {
  isPurmerend: boolean
  deliveryMethod: 'delivery' | 'pickup'
  value: string
  onChange: (method: string) => void
  availableMethods?: string[]
}

export function PaymentMethodSelector({ 
  isPurmerend,
  deliveryMethod,
  value,
  onChange,
  availableMethods,
}: PaymentMethodSelectorProps) {
  const isDelivery = deliveryMethod === 'delivery'

  const paymentMethods: (PaymentMethod & { icon: JSX.Element; description: string })[] = [
    { 
      id: 'ideal', 
      label: 'iDEAL', 
      available: true,
      icon: <BanknotesIcon className="w-6 h-6" />,
      description: 'Betaal veilig met je eigen bank'
    },
    { 
      id: 'cash', 
      label: 'Contant bij levering', 
      available: isPurmerend && isDelivery,
      icon: <BanknotesIcon className="w-6 h-6" />,
      description: 'Alleen mogelijk bij bezorging in Purmerend'
    }
  ]

  let methods = paymentMethods.filter(m => m.available)
  if (availableMethods && availableMethods.length > 0) {
    const set = new Set(availableMethods)
    methods = methods.filter(m => set.has(m.id))
  }

  return (
    <div className="space-y-4">
      <RadioGroup value={value} onChange={onChange} className="space-y-2">
        {methods.map((method) => (
          <RadioGroup.Option
            key={method.id}
            value={method.id}
            className={({ active, checked }) =>
              `relative flex cursor-pointer rounded-lg px-4 py-4 border-2 transition-all duration-200 ${
                checked
                  ? 'border-primary-500 bg-primary-50'
                  : active
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`
            }
          >
            {({ checked }) => (
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-primary-600 mr-3">
                    {method.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {method.label}
                    </p>
                    <p className="text-sm text-gray-500">
                      {method.description}
                    </p>
                  </div>
                </div>
                {checked && (
                  <CheckCircleIcon className="w-6 h-6 text-primary-600" />
                )}
              </div>
            )}
          </RadioGroup.Option>
        ))}
      </RadioGroup>

      {!isPurmerend && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Bezorging met contante betaling is alleen mogelijk in Purmerend.
          </p>
        </div>
      )}
    </div>
  )
}