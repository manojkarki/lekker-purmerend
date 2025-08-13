'use client'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useState } from 'react'
import { CakeIcon, CalendarIcon, ClockIcon, ArrowLeftIcon, ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/contexts/CartContext'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  publishedAt: string
  readingTime: number
  category: string
  featured: boolean
  coverImage: string
  author?: string
  tags?: string[]
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { cart } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Mock blog data (same as in blog listing page)
  const posts: BlogPost[] = [
    {
      id: 1,
      title: 'De perfecte chocoladetaart: tips van een bakker',
      slug: 'perfecte-chocoladetaart-tips',
      excerpt: 'Ontdek de geheimen achter onze populairste chocoladetaart en leer hoe je thuis de perfecte textuur kunt bereiken.',
      content: `
# De Perfecte Chocoladetaart: Tips van een Bakker

Als ervaren bakker deel ik graag mijn geheimen voor het maken van de perfecte chocoladetaart. Na jaren van experimenteren en verfijnen, heb ik een aantal essentiële tips ontwikkeld die het verschil maken tussen een goede en een uitstekende chocoladetaart.

## De Basis: Kwaliteit Chocolade

Het allerbelangrijkste ingrediënt is natuurlijk de chocolade zelf. Ik gebruik altijd **Belgische chocolade** met minimaal 70% cacao voor de intense smaak. De kwaliteit van je chocolade bepaalt direct de smaak van je eindproduct.

### Mijn favoriete chocolademerken:
- **Callebaut** - Voor professionele resultaten
- **Valrhona** - Voor een intense, complexe smaak  
- **Cacao Barry** - Voor een zachte, romige textuur

## De Techniek: Temperatuurcontrole

De temperatuur is cruciaal bij het werken met chocolade. Hier zijn mijn gouden regels:

1. **Smelt chocolade altijd au bain-marie** - Nooit direct op het vuur
2. **Houd de temperatuur onder de 50°C** - Anders wordt de chocolade korrelig
3. **Laat ingrediënten op kamertemperatuur komen** - Voor een gladde menging

## Het Geheim: De Ganache

Een goede ganache is het hart van elke chocoladetaart. Mijn recept:

- 300g pure chocolade (fijngehakt)
- 250ml verse room (35% vet)
- 50g boter (op kamertemperatuur)
- Snufje zeezout

**Werkwijze:**
1. Verwarm de room tot net voor het kookpunt
2. Giet over de chocolade en laat 2 minuten staan
3. Roer van binnen naar buiten tot een gladde massa
4. Voeg de boter en zout toe voor extra glans

## Pro Tips voor Thuis

### Tip 1: De Juiste Pan
Gebruik een springvorm van 24cm met hoge rand. Bekleed de bodem met bakpapier en vet de randen in.

### Tip 2: Ovens Verschillen
Elke oven bakt anders. Start met 10 minuten minder dan het recept aangeeft en controleer regelmatig met een satéprikker.

### Tip 3: Geduld met Afkoelen
Laat de taart minimaal 4 uur afkoelen voordat je hem uit de vorm haalt. Voor het beste resultaat: een nacht in de koelkast.

## Variaties die Ik Aanraad

- **Met sinaasappel:** Voeg geraspte sinaasappelschil toe aan de ganache
- **Met noten:** Gehakte hazelnoten of walnoten door het beslag
- **Met koffie:** Een shot espresso versterkt de chocoladesmaak

## Veelgemaakte Fouten

❌ **Te heet smelten** - Chocolade wordt korrelig
❌ **Overmixen** - Lucht in de ganache geeft luchtbellen  
❌ **Te vroeg uit vorm halen** - Taart valt uit elkaar

## Bewaren en Serveren

Een goed gemaakte chocoladetaart houdt zich 3-4 dagen in de koelkast. Haal hem 30 minuten voor serveren uit de koelkast voor de beste textuur.

**Serveer met:**
- Verse frambozen
- Slagroom met vanille
- Een bolletje vanille-ijs

---

*Heb je vragen over dit recept? Stuur me een berichtje! Ik help graag mee om jouw chocoladetaart perfect te krijgen.*
      `,
      publishedAt: '2025-01-10',
      readingTime: 5,
      category: 'Recepten',
      featured: true,
      coverImage: '🍫',
      author: 'Sarah van der Berg',
      tags: ['chocolade', 'taart', 'bakken', 'recepten']
    },
    {
      id: 2,
      title: 'Seizoensgebonden ingrediënten in de winter',
      slug: 'seizoensgebonden-ingredienten-winter',
      excerpt: 'Waarom we in de winter kiezen voor bepaalde ingrediënten en hoe dit de smaak van onze producten beïnvloedt.',
      content: `
# Seizoensgebonden Ingrediënten in de Winter

De winter brengt zijn eigen unieke smaakpalet met zich mee. In deze koude maanden kies ik bewust voor ingrediënten die niet alleen seizoensgebonden zijn, maar ook warmte en troost bieden.

## Waarom Seizoensgebonden Bakken?

**Verse kwaliteit** - Seizoensproducten zijn op hun hoogtepunt qua smaak
**Duurzaamheid** - Kortere transportafstanden zijn beter voor het milieu  
**Authenticiteit** - Elk seizoen heeft zijn eigen karakteristieke smaken

## Winter Ingrediënten die ik Graag Gebruik

### Specerijen
- **Kaneel** - Voor warmte en gezelligheid
- **Kardemom** - Subtiel en aromatisch
- **Gemberpoeder** - Voor een pittige kick
- **Kruidnagel** - Klassiek winters

### Fruit
- **Peren** - Perfect in season nu
- **Appels** - Nederlandse rassen zijn op hun best
- **Citrusvruchten** - Voor frisheid in donkere dagen

### Noten en Zaden
- **Walnoten** - Rijk en voedzaam
- **Amandelen** - Veelzijdig en lekker
- **Hazelnoten** - Lokaal en vol smaak

*Meer content zou hier komen in een echte blog post...*
      `,
      publishedAt: '2025-01-08',
      readingTime: 3,
      category: 'Achter de schermen',
      featured: false,
      coverImage: '🍎',
      author: 'Sarah van der Berg',
      tags: ['seizoenen', 'ingrediënten', 'winter']
    },
    {
      id: 3,
      title: 'Nieuwe stroopwafel receptuur gelanceerd!',
      slug: 'nieuwe-stroopwafel-receptuur',
      excerpt: 'Na maanden testen hebben we onze stroopwafel receptuur geperfectioneerd. Proef het verschil!',
      content: `
# Nieuwe Stroopwafel Receptuur Gelanceerd!

Het is eindelijk zover! Na maanden van testen, proeven en verfijnen, zijn we trots om onze nieuwe stroopwafel receptuur te lanceren.

## Wat is er Veranderd?

### De Stroopvulling
- **Meer vanille** - Voor een rijkere smaak
- **Minder suiker** - Maar niet minder zoet
- **Echte Bourbon vanille** - Geen kunstmatige aroma's

### De Wafel
- **Krokanter** - Door aangepaste baktijd
- **Lichter** - Nieuw meel mengsel
- **Meer smaak** - Toegevoegde kaneel en kardemom

## Het Testproces

Drie maanden lang hebben we verschillende recepturen getest:
- 15 verschillende stroopmengsels
- 8 variaties van het wafelbeslag  
- Meer dan 200 proefnemers

**Het resultaat:** Een stroopwafel die perfect balanceert tussen krokant en chewy, met een stroopvulling die niet te zoet is maar wel vol van smaak.

## Nu Beschikbaar

Je kunt onze nieuwe stroopwafels nu bestellen via de webshop of ophalen in ons atelier. We zijn benieuwd naar je mening!

*Heb je ze al geproefd? Laat het ons weten wat je ervan vindt!*
      `,
      publishedAt: '2025-01-05',
      readingTime: 2,
      category: 'Nieuws',
      featured: false,
      coverImage: '🥧',
      author: 'Sarah van der Berg',
      tags: ['stroopwafel', 'nieuw', 'receptuur']
    },
    {
      id: 4,
      title: '5 tips voor het bewaren van je taart',
      slug: 'tips-bewaren-taart',
      excerpt: 'Leer hoe je je huisgemaakte taart het beste kunt bewaren voor optimale versheid en smaak.',
      content: `
# 5 Tips voor het Bewaren van je Taart

Een mooie taart gemaakt of gekocht, maar hoe zorg je ervoor dat hij lang lekker blijft? Hier zijn mijn beste tips.

## Tip 1: De Juiste Temperatuur

**Koelkast vs. Kamertemperatuur**
- Taarten met room of custard: altijd in de koelkast
- Droge cakes: kunnen bij kamertemperatuur
- Chocoladetaarten: liefst koel bewaren

## Tip 2: Afdekken is Cruciaal

- Gebruik plastic folie of een taartdoos
- Vermijd dat de taart uitdroogt
- Voorkom dat andere geuren de smaak beïnvloeden

## Tip 3: Het Juiste Moment

30 minuten voor serveren uit de koelkast voor de beste textuur en smaak.

## Tip 4: Invriezen Kan Ook

Sommige taarten kunnen prima worden ingevroren:
- ✅ Boterkoek en droge cakes
- ✅ Cheesecake (zonder topping)
- ❌ Taarten met verse room
- ❌ Fruit taarten

## Tip 5: Portioneren

Snij grote taarten in porties voordat je ze bewaart - zo blijft de rest langer vers.

*Deze tips helpen je om langer van je lekkere taart te genieten!*
      `,
      publishedAt: '2025-01-03',
      readingTime: 4,
      category: 'Tips',
      featured: false,
      coverImage: '💡',
      author: 'Sarah van der Berg',
      tags: ['bewaren', 'tips', 'taart']
    },
    {
      id: 5,
      title: 'Glutenvrije alternatieven: zo doe je dat',
      slug: 'glutenvrije-alternatieven-tips',
      excerpt: 'Praktische tips voor het maken van heerlijke glutenvrije gebakjes zonder in te leveren op smaak.',
      content: `
# Glutenvrije Alternatieven: Zo Doe Je Dat

Glutenvrij bakken hoeft niet moeilijk te zijn. Met de juiste kennis en ingrediënten maak je gebakjes die iedereen lekker vindt.

## De Basis: Glutenvrije Melen

### Mijn Favoriete Mix
- 40% rijstmeel (voor textuur)
- 30% amandelmeel (voor smaak) 
- 20% aardappelzetmeel (voor binding)
- 10% tapiocameel (voor elasticiteit)

### Kant-en-klare Mengsels
- **Schär** - Betrouwbaar en consistent
- **Dr. Oetker** - Goed verkrijgbaar
- **Doves Farm** - Premium kwaliteit

## Bindmiddelen

Zonder gluten heb je extra binding nodig:
- **Xanthaangom** - 1 tl per 200g meel
- **Guargom** - Als alternatief voor xanthaangom
- **Extra eieren** - Natuurlijke binding

## Veelvoorkomende Problemen en Oplossingen

**Droge textuur?**
→ Voeg extra vocht toe (melk, olie)

**Broos deeg?**
→ Meer bindmiddel gebruiken

**Smakeloos?**
→ Extra vanille of specerijen

## Mijn Glutenvrije Bestsellers

1. **Amandel biscotti** - Krokant en vol smaak
2. **Chocolade brownies** - Fudgy en rijk
3. **Citroen cupcakes** - Licht en luchtig

*Experimenteren is de sleutel tot succes bij glutenvrij bakken!*
      `,
      publishedAt: '2025-01-01',
      readingTime: 6,
      category: 'Tips',
      featured: false,
      coverImage: '🌾',
      author: 'Sarah van der Berg',
      tags: ['glutenvrij', 'tips', 'alternatieven']
    },
    {
      id: 6,
      title: 'Ons nieuwe atelier: een kijkje achter de schermen',
      slug: 'nieuw-atelier-achter-schermen',
      excerpt: 'We nemen je mee voor een rondleiding door ons vernieuwde atelier waar alle magie gebeurt.',
      content: `
# Ons Nieuwe Atelier: Een Kijkje Achter de Schermen

Vorige maand hebben we ons atelier volledig vernieuwd! Tijd voor een rondleiding door de ruimte waar alle lekkernijen tot leven komen.

## De Nieuwe Indeling

### Bak Zone
- Professionele convectie ovens
- Grote werkbank van RVS
- Speciale koeling voor chocoladework

### Decoratie Hoek  
- Draaitafels voor taarten
- Spuitbussen en tools
- Natuurlijk licht voor detail werk

### Verpakking Gebied
- Hygienische verpakruimte
- Koelcellen voor afgewerkte producten
- Verzendstation voor online orders

## Nieuwe Apparatuur

**KitchenAid Mixers** - Voor perfecte beslagen
**Chocolade Tempering Machine** - Voor glanzende coating
**Proofing Cabinet** - Voor gistdeeg op de juiste temperatuur

## Duurzaamheid

Ons nieuwe atelier is ingericht met duurzaamheid in gedachten:
- LED verlichting overal
- Energiezuinige apparatuur  
- Afvalscheiding en recycling
- Lokale leveranciers

## Open Dagen

Binnenkort organiseren we open dagen waar je een kijkje kunt nemen. Houd onze website in de gaten voor data!

*We zijn trots op ons nieuwe atelier en kunnen niet wachten om je er alles te laten zien.*
      `,
      publishedAt: '2024-12-28',
      readingTime: 3,
      category: 'Achter de schermen',
      featured: false,
      coverImage: '🏠',
      author: 'Sarah van der Berg',
      tags: ['atelier', 'nieuw', 'achter de schermen']
    }
  ]

  const post = posts.find(p => p.slug === params.slug)

  if (!post) {
    notFound()
  }

  // Get related posts (same category, excluding current post)
  const relatedPosts = posts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <CakeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 flex-shrink-0" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                Lekker Purmerend
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-3 lg:gap-6">
              <Link href="/producten" className="text-gray-700 hover:text-primary-600 text-sm lg:text-base">
                Producten
              </Link>
              <Link href="/blog" className="text-primary-600 font-medium text-sm lg:text-base">
                Blog
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600 text-sm lg:text-base">
                Contact
              </Link>
              <Link href="/cart" className="text-gray-700 hover:text-primary-600 relative">
                <ShoppingCartIcon className="w-5 h-5 lg:w-6 lg:h-6" />
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center">
                  {cart.totalItems}
                </span>
              </Link>
            </div>
            <div className="sm:hidden flex items-center gap-2">
              <Link href="/cart" className="relative p-2">
                <ShoppingCartIcon className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.totalItems}
                </span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-primary-600"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-5 h-5" />
                ) : (
                  <Bars3Icon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="container py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/producten" 
                className="text-gray-700 hover:text-primary-600 py-2 px-4 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Producten
              </Link>
              <Link 
                href="/blog" 
                className="text-primary-600 font-medium py-2 px-4 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-700 hover:text-primary-600 py-2 px-4 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="container py-4">
        <nav className="text-sm px-4">
          <Link href="/" className="text-gray-500 hover:text-primary-600">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/blog" className="text-gray-500 hover:text-primary-600">Blog</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 truncate">{post.title}</span>
        </nav>
      </div>

      <div className="container pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Terug naar blog
          </Link>

          {/* Article Header */}
          <article className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Cover Image */}
            <div className="aspect-video bg-gray-100 flex items-center justify-center text-8xl">
              {post.coverImage}
            </div>

            {/* Article Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Meta Info */}
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                  {post.category}
                </span>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <CalendarIcon className="w-4 h-4" />
                  {new Date(post.publishedAt).toLocaleDateString('nl-NL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <ClockIcon className="w-4 h-4" />
                  {post.readingTime} min leestijd
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Author */}
              {post.author && (
                <div className="mb-8 pb-8 border-b">
                  <p className="text-gray-600">
                    Door <span className="font-medium text-gray-900">{post.author}</span>
                  </p>
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: post.content
                      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/^- (.*$)/gm, '<li>$1</li>')
                      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
                      .replace(/❌ (.*$)/gm, '<div class="flex items-center gap-2 text-red-600 mb-2"><span>❌</span><span>$1</span></div>')
                      .replace(/✅ (.*$)/gm, '<div class="flex items-center gap-2 text-green-600 mb-2"><span>✅</span><span>$1</span></div>')
                      .replace(/→ (.*$)/gm, '<div class="ml-4 text-gray-600">→ $1</div>')
                      .replace(/\n\n/g, '</p><p>')
                      .replace(/^(?!<)/gm, '<p>')
                      .replace(/(?<!>)$/gm, '</p>')
                      .replace(/<p><\/p>/g, '')
                      .replace(/<p>(<h[1-6]>)/g, '$1')
                      .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
                      .replace(/<p>(<ul>)/g, '$1')
                      .replace(/(<\/ul>)<\/p>/g, '$1')
                      .replace(/<p>(<div)/g, '$1')
                      .replace(/(<\/div>)<\/p>/g, '$1')
                  }}
                />
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Meer uit {post.category}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link 
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-gray-100 flex items-center justify-center text-4xl">
                      {relatedPost.coverImage}
                    </div>
                    
                    <div className="p-4 sm:p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(relatedPost.publishedAt).toLocaleDateString('nl-NL')}
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {relatedPost.readingTime} min
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Extra bottom spacing for mobile scroll */}
      <div className="pb-16 sm:pb-8"></div>
    </div>
  )
}