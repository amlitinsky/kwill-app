"use client"

import { motion, useAnimation } from "framer-motion"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import React from "react"

// Pre-calculate random positions to avoid hydration mismatch
const bubbles = Array.from({ length: 20 }, (_, i) => ({
  width: 50 + ((i * 17) % 100),
  height: 50 + ((i * 23) % 100),
  top: ((i * 13) % 100),
  left: ((i * 19) % 100),
  yOffset: ((i * 7) % 100) - 50,
  scale: 1 + ((i * 11) % 100) / 100,
  rotate: ((i * 29) % 360),
  duration: 10 + ((i * 31) % 10),
}));

const spreadsheetData = {
  headers: ["Topic", "Key Points", "Action Items", "Owner", "Due Date"],
  rows: [
    ["Product Strategy", "Market expansion plans", "Research competitors", "Sarah K.", "2024-03-15"],
    ["Q1 Review", "Revenue up 25%", "Update forecast", "John M.", "2024-03-20"],
    ["Tech Planning", "New feature roadmap", "Create timeline", "Alex R.", "2024-03-25"],
    ["Team Updates", "Hiring 2 engineers", "Post job listings", "Lisa T.", "2024-03-18"],
    ["Budget Review", "Under budget by 10%", "Prepare Q2 plan", "Mike P.", "2024-03-22"],
  ]
};

export default function Hero() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
      <AnimatedBackground />
      <div className="text-center relative z-10">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Streamline Your Meetings into
          <br />
          <span className="text-blue-500 dark:text-blue-400">Actionable Data</span>
        </motion.h1>
        <motion.p
          className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Kwill is an AI-powered meeting assistant that automatically captures, analyzes, and organizes your Zoom
          meetings into structured spreadsheet data.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg"
          >
            Get Started
          </Button>
        </motion.div>
      </div>
      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        <FancySpreadsheetAnimation />
      </motion.div>
    </section>
  )
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0">
      {bubbles.map((bubble, i) => (
        <motion.div
          key={i}
          className="absolute bg-blue-500 dark:bg-blue-400 rounded-full opacity-5 dark:opacity-[0.07]"
          style={{
            width: bubble.width,
            height: bubble.height,
            top: `${bubble.top}%`,
            left: `${bubble.left}%`,
          }}
          animate={{
            y: [0, bubble.yOffset],
            scale: [1, bubble.scale],
            rotate: [0, bubble.rotate],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  )
}

function FancySpreadsheetAnimation() {
  const controls = useAnimation()

  useEffect(() => {
    controls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }))
  }, [controls])

  return (
    <div className="bg-card dark:bg-card/50 rounded-lg shadow-2xl dark:shadow-lg dark:shadow-blue-500/10 p-6 max-w-4xl mx-auto relative overflow-hidden">
      <div className="grid grid-cols-5 gap-4">
        {/* Headers */}
        {spreadsheetData.headers.map((header, i) => (
          <motion.div
            key={`header-${i}`}
            className="h-12 bg-muted dark:bg-muted/50 rounded overflow-hidden font-medium"
            custom={i}
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
          >
            <motion.div
              className="h-full bg-blue-100 dark:bg-blue-500/20 px-3 flex items-center"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.2 + 0.5 }}
                className="truncate text-sm text-foreground"
              >
                {header}
              </motion.span>
            </motion.div>
          </motion.div>
        ))}

        {/* Data Rows */}
        {spreadsheetData.rows.map((row, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {row.map((cell, cellIndex) => (
              <motion.div
                key={`cell-${rowIndex}-${cellIndex}`}
                className="h-12 bg-muted dark:bg-muted/50 rounded overflow-hidden"
                custom={spreadsheetData.headers.length + (rowIndex * spreadsheetData.headers.length) + cellIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={controls}
              >
                <motion.div
                  className="h-full bg-blue-50 dark:bg-blue-500/10 px-3 flex items-center"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ 
                    duration: 0.5, 
                    delay: (spreadsheetData.headers.length * 0.2) + (rowIndex * 0.3) + (cellIndex * 0.2)
                  }}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: (spreadsheetData.headers.length * 0.2) + (rowIndex * 0.3) + (cellIndex * 0.2) + 0.5 
                    }}
                    className="truncate text-sm text-muted-foreground"
                  >
                    {cell}
                  </motion.span>
                </motion.div>
              </motion.div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Progress bar and checkmark */}
      <motion.div
        className="absolute bottom-0 left-0 h-2 bg-blue-500 dark:bg-blue-400"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-green-500 dark:bg-green-400 flex items-center justify-center text-white font-bold"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 3.5 }}
      >
        ✓
      </motion.div>
    </div>
  )
}

