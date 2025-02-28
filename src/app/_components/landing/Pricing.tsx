"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    hours: 2,
    price: 0,
    features: ["First 2 hours of meeting processing", "Email support"],
  },
  {
    name: "Pro",
    hours: 10,
    price: 15,
    features: ["10 hours of meeting processing", "Email support"],
  },
  {
    name: "Premium",
    hours: 15,
    price: 20,
    features: ["15 hours of meeting processing", "Priority Email support"],
  },
]

export default function Pricing() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.h2
        className="text-3xl font-bold text-center mb-12 text-foreground"
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        Simple, Transparent Pricing
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            className="bg-card dark:bg-card/50 rounded-lg shadow-lg dark:shadow-blue-500/5 p-6 relative overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.2 }}
          >
            <motion.div
              className="absolute top-0 left-0 w-full h-1 bg-blue-500 dark:bg-blue-400"
              initial={{ width: 0 }}
              animate={inView ? { width: "100%" } : {}}
              transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
            />
            <h3 className="text-2xl font-semibold mb-4 text-foreground">{plan.name}</h3>
            <motion.p
              className="text-4xl font-bold mb-6 text-foreground"
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
            >
              {plan.price === 0 ? 'Free' : `$${plan.price}`}
              {plan.price > 0 && <span className="text-xl font-normal text-muted-foreground">/mo</span>}
            </motion.p>
            <ul className="mb-8 space-y-2">
              {plan.features.map((feature, i) => (
                <motion.li
                  key={i}
                  className="flex items-center text-muted-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.2 + i * 0.1 + 0.5 }}
                >
                  <Check className="w-5 h-5 text-green-500 dark:text-green-400 mr-2 flex-shrink-0" />
                  {feature}
                </motion.li>
              ))}
            </ul>
            <Link href="/signin">
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
              >
                {plan.price === 0 ? 'Get Started' : `Choose ${plan.name}`}
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
