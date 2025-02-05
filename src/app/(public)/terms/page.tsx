import Link from 'next/link'

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using Kwill&apos;s services, you agree to be bound by these Terms of Service.</p>

        <h2>2. Description of Service</h2>
        <p>Kwill provides AI-powered meeting analysis and insights. Our service includes automated transcription of Zoom meetings, analysis of meeting content using advanced language models, and integration with Google Sheets for data storage and visualization.</p>

        <h2>3. User Responsibilities</h2>
        <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. Users must ensure they have the necessary rights and permissions to share and analyze meeting content.</p>

        <h2>4. Privacy and Data Handling</h2>
        <p>Your use of Kwill&apos;s services is governed by our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>. We handle meeting transcripts and processed data with utmost care. Users retain ownership of their data, and we only use it to provide and improve our services.</p>

        <h2>5. Third-Party Services</h2>
        <p>Our service integrates with third-party platforms such as Zoom and Google Sheets. Users are responsible for complying with the terms of service of these platforms when using them in conjunction with Kwill.</p>

        <h2>6. Subscription and Payments</h2>
        <p>Kwill offers various subscription plans, including a free tier. Paid plans are billed on a monthly basis. Users can upgrade, downgrade, or cancel their subscription at any time. Refunds are provided in accordance with our refund policy.</p>

        <h2>7. Intellectual Property</h2>
        <p>The Kwill service, including all software, algorithms, and user interfaces, is owned by Kwill. Users retain all rights to their meeting content and processed data.</p>

        <h2>8. Prohibited Uses</h2>
        <p>Users may not use Kwill&apos;s services for any illegal or unauthorized purpose, or to infringe upon any third party&apos;s rights. Misuse of our AI analysis capabilities for harmful or discriminatory purposes is strictly prohibited.</p>

        <h2>9. Modifications to Service</h2>
        <p>Kwill reserves the right to modify or discontinue, temporarily or permanently, the service with or without notice.</p>

        <h2>10. Termination</h2>
        <p>Kwill may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason, including breach of these Terms.</p>

        <h2>11. Limitation of Liability</h2>
        <p>Kwill shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the service.</p>

        <h2>12. Governing Law</h2>
        <p>These Terms shall be governed by the laws of California, without regard to its conflict of law provisions.</p>

        <h2>13. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Please review these terms periodically for changes.</p>

        <h2>14. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at support@kwill.app.</p>
      </div>
    </div>
  )
}
