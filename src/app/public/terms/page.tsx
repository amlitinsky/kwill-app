import Link from 'next/link'

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using Kwill&apos;s services, you agree to be bound by these Terms of Service.</p>

        <h2>2. Description of Service</h2>
        <p>Kwill provides AI-powered query analysis for meeting insights.</p>

        <h2>3. User Responsibilities</h2>
        <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.</p>

        <h2>4. Privacy Policy</h2>
        <p>Your use of Kwill&apos;s services is also governed by our <Link href="/public/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.</p>

        <h2>5. Modifications to Service</h2>
        <p>Kwill reserves the right to modify or discontinue, temporarily or permanently, the service with or without notice.</p>

        <h2>6. Termination</h2>
        <p>Kwill may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason.</p>

        <h2>7. Limitation of Liability</h2>
        <p>Kwill shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service.</p>

        <h2>8. Governing Law</h2>
        <p>These Terms shall be governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>

        <h2>9. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Please review these terms periodically for changes.</p>

        <h2>10. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at [Your Contact Email].</p>
      </div>
    </div>
  )
}