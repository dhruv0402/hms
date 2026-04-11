import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function Skeleton({ className, circle, style }) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-opacity-10',
        circle ? 'rounded-full' : 'rounded-lg',
        className
      )}
      style={{
        background: 'var(--bg-hover)',
        ...style
      }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
        }}
      />
    </div>
  )
}
