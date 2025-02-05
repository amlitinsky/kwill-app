import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-6 px-6 bg-background border-t">
      <div className="container mx-auto">
        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Product Info */}
            <div>
              <h3 className="font-semibold mb-3">Product</h3>
              <div className="space-y-2">
                <Link href="/pricing" className="block text-sm text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
                <Link href="/docs" className="block text-sm text-muted-foreground hover:text-foreground">
                  Docs
                </Link>
              </div>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <div className="space-y-2">
                <Link href="/support" className="block text-sm text-muted-foreground hover:text-foreground">
                  Help Center
                </Link>
                <a href="mailto:support@kwill.app" className="block text-sm text-muted-foreground hover:text-foreground">
                  Contact Us
                </a>
              </div>
            </div>
            
            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <div className="space-y-2">
                <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright Notice */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} Kwill Technologies LLC. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
  );
}
