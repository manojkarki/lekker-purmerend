'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  CakeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    alert('Bedankt voor je bericht! We nemen zo snel mogelijk contact met je op.')
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <CakeIcon className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">
                Lekker Purmerend
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/producten" className="text-gray-700 hover:text-primary-600">
                Producten
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-primary-600">
                Blog
              </Link>
              <Link href="/contact" className="text-primary-600 font-medium">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Neem Contact Op
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vragen over onze producten, speciale wensen of gewoon een praatje? 
            We horen graag van je!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Stuur ons een bericht
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="form-label">
                    Naam *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Je volledige naam"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="form-label">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="je@email.nl"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="form-label">
                    Telefoon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="06 12345678"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="form-label">
                    Onderwerp *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="">Selecteer onderwerp</option>
                    <option value="bestelling">Vraag over bestelling</option>
                    <option value="taart-op-maat">Taart op maat</option>
                    <option value="ingredienten">Ingrediënten & allergieën</option>
                    <option value="levering">Levering & ophalen</option>
                    <option value="compliment">Compliment</option>
                    <option value="klacht">Klacht</option>
                    <option value="anders">Anders</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="form-label">
                  Bericht *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="form-input resize-none"
                  placeholder="Vertel ons waar we je mee kunnen helpen..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full btn-primary text-lg py-3"
              >
                Verstuur Bericht
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Business Info */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Bezoek onze bakkerij
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPinIcon className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Adres</p>
                    <p className="text-gray-600">
                      Hoofdstraat 123<br />
                      1441 AA Purmerend<br />
                      Nederland
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <PhoneIcon className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Telefoon</p>
                    <p className="text-gray-600">0299 123 456</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <EnvelopeIcon className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">E-mail</p>
                    <p className="text-gray-600">info@lekkerpurmerend.nl</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ClockIcon className="w-6 h-6 text-primary-600" />
                Openingstijden
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Maandag - Vrijdag</span>
                  <span className="font-medium">8:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zaterdag</span>
                  <span className="font-medium">8:00 - 16:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zondag</span>
                  <span className="font-medium">Gesloten</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Bel voor grote bestellingen of speciale wensen 
                  bij voorkeur een dag van tevoren!
                </p>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Veelgestelde Vragen
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Kan ik dezelfde dag nog bestellen?
                  </p>
                  <p className="text-sm text-gray-600">
                    Ja, voor bestellingen vóór 12:00 kunnen we vaak nog dezelfde dag leveren.
                  </p>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Maken jullie ook taarten op maat?
                  </p>
                  <p className="text-sm text-gray-600">
                    Zeker! Neem contact op voor gepersonaliseerde taarten en speciale wensen.
                  </p>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Bezorgen jullie ook buiten Purmerend?
                  </p>
                  <p className="text-sm text-gray-600">
                    Momenteel bezorgen we alleen binnen Purmerend. Ophalen is altijd mogelijk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}