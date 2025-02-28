"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SignInButton } from "@clerk/nextjs"

export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-blue-500/10 dark:bg-blue-500/5 rounded-lg relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          initial={{ backgroundPosition: "0 0" }}
          animate={{ backgroundPosition: "100% 100%" }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 20, ease: "linear" }}
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(var(--blue-500) / 0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative p-8 sm:p-12 text-center">
          <motion.h2
            className="text-3xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Ready to Transform Your Meetings?
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Start capturing valuable insights from your meetings today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg"
              >
                Get Started for Free
              </Button>
            </SignInButton>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
