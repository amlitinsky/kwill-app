"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Clock, FileSpreadsheet, Zap } from "lucide-react"

const features = [
  {
    icon: Clock,
    title: "Save Time",
    description:
      "Automatically capture and organize meeting information, eliminating manual note-taking and data entry.",
  },
  {
    icon: FileSpreadsheet,
    title: "Structured Data",
    description:
      "Convert unstructured meeting discussions into organized spreadsheet data for easy analysis and action.",
  },
  {
    icon: Zap,
    title: "AI-Powered",
    description:
      "Leverage advanced AI to extract key insights, action items, and important details from your meetings.",
  },
]

export default function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.h2
        className="text-3xl font-bold text-center mb-12 text-foreground"
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        Key Features
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
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
            <motion.div
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
            >
              <feature.icon className="w-12 h-12 text-blue-500 dark:text-blue-400 mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

