import { useState } from 'react'
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import Button from '../components/ui/Button'

const details = [
  { icon: HiOutlineLocationMarker, title: 'Address', text: '123 Oxford Street, Accra, Ghana' },
  { icon: HiOutlinePhone, title: 'Phone', text: '+233 30 123 4567' },
  { icon: HiOutlineMail, title: 'Email', text: 'support@bestmart.com' },
  { icon: HiOutlineClock, title: 'Working Hours', text: 'Mon – Sat: 8am – 8pm' },
]

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email'
    if (!form.message.trim()) next.message = 'Message is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      setSubmitted(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    }
  }

  return (
    <div>
      <section className="bg-brand-navy py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white">Get in Touch</h1>
          <p className="mt-4 text-blue-100 text-lg">
            Have a question or need help with an order? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          {details.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-11 h-11 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
                <Icon className="text-brand-blue" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {submitted && (
            <div className="mb-4 rounded-lg bg-green-50 text-green-700 text-sm px-4 py-2.5">
              Thanks for reaching out! We'll get back to you soon.
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Input
                id="name"
                name="name"
                label="Full name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
              />
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
              />
            </div>
            <Input
              id="subject"
              name="subject"
              label="Subject"
              placeholder="How can we help?"
              value={form.subject}
              onChange={handleChange}
            />
            <TextArea
              id="message"
              name="message"
              label="Message"
              rows={5}
              placeholder="Write your message here..."
              value={form.message}
              onChange={handleChange}
              error={errors.message}
            />
            <Button type="submit" className="w-full sm:w-auto">
              Send Message
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Contact
