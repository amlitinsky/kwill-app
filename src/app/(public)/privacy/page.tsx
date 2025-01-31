import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose max-w-none">
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, use our services, or communicate with us. This includes:</p>
        <ul>
          <li>Account information (name, email, password)</li>
          <li>Meeting data (Zoom links, transcripts, processed data)</li>
          <li>Google Sheets information (spreadsheet IDs, column headers)</li>
          <li>Custom prompting for meeting analysis</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services, including:</p>
        <ul>
          <li>Facilitating and analyzing Zoom meetings</li>
          <li>Processing meeting transcripts using AI technology</li>
          <li>Integrating with Google Sheets to store and visualize data</li>
          <li>Personalizing and optimizing our services</li>
        </ul>

        <h2>3. Information Sharing and Disclosure</h2>
        <p>We do not share personal information with companies, organizations, or individuals outside of Kwill except in the following cases:</p>
        <ul>
          <li>With your consent</li>
          <li>For legal reasons</li>
          <li>To protect rights, property, or safety</li>
          <li>With third-party service providers (e.g., Zoom, Google, Recall.ai) as necessary to provide our services</li>
        </ul>

        <h2>4. Data Retention</h2>
        <p>We retain your information for as long as your account is active or as needed to provide you services. Specific retention periods:</p>
        <ul>
          <li>Account information: Retained until account deletion</li>
          <li>Meeting transcripts: Retained for 30 days after processing</li>
          <li>Processed meeting data: Retained until manually deleted by the user</li>
        </ul>

        <h2>5. Security</h2>
        <p>We take reasonable measures to help protect your information, including:</p>
        <ul>
          <li>Encrypting sensitive data in transit and at rest</li>
          <li>Regular security audits and penetration testing</li>
          <li>Strict access controls for our employees</li>
        </ul>

        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access, correct, or delete your personal information</li>
          <li>Object to or restrict certain processing of your data</li>
          <li>Request a copy of all data associated with your account</li>
          <li>Delete specific meeting data or your entire account</li>
        </ul>
        <p>You can exercise these rights through your account settings or by contacting us directly.</p>

        <h2>7. Changes to this Policy</h2>
        <p>We may change this privacy policy from time to time. We will post any privacy policy changes on this page and, if the changes are significant, we will provide a more prominent notice.</p>

        <h2>8. Contact Us</h2>
        <p>If you have any questions about this privacy policy, please contact us at privacy@kwill.app.</p>

        <h2>9. Terms of Service</h2>
        <p>Please also read our <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>, which outlines the terms governing the use of our service.</p>
      </div>
    </div>
  )
}
