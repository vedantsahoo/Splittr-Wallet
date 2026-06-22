import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function ToastContainer() {
  const { toastQueue, dismissToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-[500] space-y-3 pointer-events-none">
      <AnimatePresence>
        {toastQueue.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="pointer-events-auto flex items-start gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.1)] border-l-4 min-w-[280px] max-w-[360px]"
            style={{
              borderLeftColor:
                toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : '#4F46E5',
            }}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-[#4F46E5] shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-[#333] flex-1">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss toast"
              title="Dismiss toast"
              className="p-1 rounded-full hover:bg-[#F5F5F5] shrink-0"
            >
              <X className="w-4 h-4 text-[#888]" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
