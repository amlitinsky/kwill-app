"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

const steps = [
  {
    title: "Connect Your Zoom",
    description: "Integrate Kwill with your Zoom account for seamless meeting capture.",
  },
  {
    title: "Set Up Your Spreadsheet",
    description: "Define your data structure and customize extraction parameters.",
  },
  {
    title: "Join Your Meeting",
    description: "Kwill automatically joins and records your Zoom meetings.",
  },
  {
    title: "AI Analysis",
    description: "Our AI processes the meeting transcript and extracts key information.",
  },
  {
    title: "Data Population",
    description: "Your spreadsheet is automatically populated with structured data.",
  },
]

export default function HowItWorks() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.h2
        className="text-3xl font-bold text-center mb-12"
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        How It Works
      </motion.h2>
      <div className="space-y-12 relative">
        <motion.div
          className="absolute left-[20px] top-0 bottom-0 w-1 bg-blue-200"
          initial={{ height: 0 }}
          animate={inView ? { height: "100%" } : {}}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {steps.map((step, index) => (
          <StepItem key={index} step={step} index={index} inView={inView} />
        ))}
      </div>
    </section>
  )
}

interface Step {
  title: string;
  description: string;
}

function StepItem({ step, index, inView }: { step: Step, index: number, inView: boolean }) {
  return (
    <motion.div
      className="flex items-center relative"
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.2 }}
    >
      <motion.div
        className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl z-10"
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
      >
        {index + 1}
      </motion.div>
      <div className="ml-8">
        <h3 className="text-xl font-semibold">{step.title}</h3>
        <p className="text-gray-600">{step.description}</p>
      </div>
    </motion.div>
  )
}

