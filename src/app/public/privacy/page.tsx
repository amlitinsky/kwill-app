import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose max-w-none">
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, use our services, or communicate with us.</p>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect Kwill and our users.</p>

        <h2>3. Information Sharing and Disclosure</h2>
        <p>We do not share personal information with companies, organizations, or individuals outside of Kwill except in the following cases: with your consent, for legal reasons, or to protect rights, property, or safety.</p>

        <h2>4. Data Retention</h2>
        <p>We retain your information for as long as your account is active or as needed to provide you services, comply with our legal obligations, resolve disputes, and enforce our agreements.</p>

        <h2>5. Security</h2>
        <p>We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</p>

        <h2>6. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal information. You can do this through your account settings or by contacting us directly.</p>

        <h2>7. Changes to this Policy</h2>
        <p>We may change this privacy policy from time to time. We will post any privacy policy changes on this page.</p>

        <h2>8. Contact Us</h2>
        <p>If you have any questions about this privacy policy, please contact us at [Your Contact Email].</p>

        <h2>9. Terms of Service</h2>
        <p>Please also read our <Link href="/public/terms" className="text-blue-600 hover:underline">Terms of Service</Link>, which outlines the terms governing the use of our service.</p>
      </div>
    </div>
  )
}