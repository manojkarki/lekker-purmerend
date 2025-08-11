'use client'

import { useState } from 'react'
import { isPurmerend } from '@lekker/utils'
import { MapPinIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { PurmerendDetection } from '@lekker/shared-types'

interface PurmerendGateProps {
  onDetectionChange: (detection: PurmerendDetection) => void
  className?: string
}

export function PurmerendGate({ onDetectionChange, className = '' }: PurmerendGateProps) {
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [detection, setDetection] = useState<PurmerendDetection | null>(null)

  const handleCheck = () => {
    const result = isPurmerend(city, postalCode)
    setDetection(result)
    onDetectionChange(result)
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <MapPinIcon className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Bezorg- en betaalmogelijkheden checken
        </h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Vul je locatie in om te zien welke levermogelijkheden en betaalmethodes beschikbaar zijn.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Plaats
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="bijv. Purmerend"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postcode
            </label>
            <input
              type="text"
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="bijv. 1441 AA"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={!city && !postalCode}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Mogelijkheden checken
        </button>

        {/* Results */}
        {detection && (
          <div className={`mt-6 p-4 rounded-lg border ${
            detection.isPurmerend 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start gap-3">
              {detection.isPurmerend ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
              )}
              
              <div className="flex-1">
                <h4 className={`font-semibold ${
                  detection.isPurmerend ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {detection.isPurmerend ? 'Geweldig! 🎉' : 'Helaas geen bezorging 📦'}
                </h4>
                
                <div className={`mt-2 text-sm ${
                  detection.isPurmerend ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {detection.isPurmerend ? (
                    <div className="space-y-2">
                      <p>Je woont in Purmerend, dus we kunnen gratis bij je bezorgen!</p>
                      <div className="mt-3">
                        <p className="font-medium">Beschikbare opties:</p>
                        <ul className="mt-1 space-y-1 ml-4">
                          <li>✅ Gratis bezorging</li>
                          <li>✅ Ophalen in de winkel</li>
                          <li>✅ Alle betaalmethodes (inclusief contant bij levering)</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p>Bezorging is alleen mogelijk binnen Purmerend.</p>
                      <div className="mt-3">
                        <p className="font-medium">Beschikbare opties:</p>
                        <ul className="mt-1 space-y-1 ml-4">
                          <li>✅ Ophalen in de winkel (gratis)</li>
                          <li>✅ Betaling via iDEAL, creditcard of bankoverschrijving</li>
                          <li>❌ Geen contante betaling mogelijk</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}