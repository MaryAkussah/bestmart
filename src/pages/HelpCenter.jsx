import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineLifebuoy,
  HiOutlineChevronDown,
  HiOutlineTruck,
  HiOutlineCreditCard,
  HiOutlineArrowUturnLeft,
  HiOutlineUserCircle,
} from 'react-icons/hi2'
import Button from '../components/ui/Button'

const topics = [
  {
    category: 'Orders & Delivery',
    icon: HiOutlineTruck,
    questions: [
      {
        q: 'How long does delivery take?',
        a: 'Most orders arrive within 2–5 business days depending on your region. You can track an order\'s status from your account once it ships.',
      },
      {
        q: 'Can I change my delivery address after ordering?',
        a: 'Contact our support team as soon as possible — we can update the address if the order hasn\'t been dispatched yet.',
      },
    ],
  },
  {
    category: 'Payments',
    icon: HiOutlineCreditCard,
    questions: [
      {
        q: 'What payment methods are accepted?',
        a: 'BestMart supports mobile money and major debit/credit cards at checkout, all processed through an encrypted, secure gateway.',
      },
      {
        q: 'Is it safe to save my card details?',
        a: 'Yes — we never store raw card numbers ourselves. Payments are handled by a PCI-compliant payment processor.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    icon: HiOutlineArrowUturnLeft,
    questions: [
      {
        q: 'What is your return policy?',
        a: 'Most items can be returned within 30 days of delivery, provided they\'re unused and in their original packaging.',
      },
      {
        q: 'How long do refunds take?',
        a: 'Once a return is received and inspected, refunds are issued to your original payment method within 5–7 business days.',
      },
    ],
  },
  {
    category: 'Selling on BestMart',
    icon: HiOutlineUserCircle,
    questions: [
      {
        q: 'How do I start selling?',
        a: 'Create a free seller account from the Sign Up page, then list your first product from your seller dashboard.',
      },
      {
        q: 'Are there any listing fees?',
        a: 'Creating an account and listing products is free. We only take a small commission on completed sales.',
      },
    ],
  },
]

function AccordionItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900">{q}</span>
        <HiOutlineChevronDown
          className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          size={18}
        />
      </button>
      {isOpen && <p className="text-sm text-gray-600 pb-4 pr-8">{a}</p>}
    </div>
  )
}

function HelpCenter() {
  const [openKey, setOpenKey] = useState(null)

  const toggle = (key) => {
    setOpenKey((prev) => (prev === key ? null : key))
  }

  return (
    <div>
      <section className="bg-brand-navy py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HiOutlineLifebuoy className="text-white mx-auto" size={36} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-4">Help Center</h1>
          <p className="mt-4 text-blue-100 text-lg">
            Answers to common questions about shopping and selling on BestMart.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-10">
          {topics.map(({ category, icon: Icon, questions }) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon className="text-brand-blue" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{category}</h2>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6">
                {questions.map(({ q, a }) => {
                  const key = `${category}-${q}`
                  return (
                    <AccordionItem
                      key={key}
                      q={q}
                      a={a}
                      isOpen={openKey === key}
                      onToggle={() => toggle(key)}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-gray-900">Still need help?</h3>
          <p className="text-gray-600 mt-1 text-sm">
            Our support team is happy to help with anything not covered here.
          </p>
          <Link to="/contact">
            <Button variant="accent" className="mt-5">Contact Support</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HelpCenter
