import { motion } from "framer-motion";
import { CheckCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const TELEGRAM_LINK = "https://t.me/+rjyWoEWqv2gzZmQ8";

const RegistrationSuccessPage = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = TELEGRAM_LINK;
    }, 2000); // Redirect after 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EFEFEF] font-sans">
      <div className="w-full max-w-md space-y-4 px-4 py-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8E8E5]"
          >
            <CheckCircle className="h-8 w-8 text-[#7B2418]" />
          </motion.div>

          <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight text-[#1C1815] sm:text-3xl">
            Registration Successful
          </h1>

          <p className="mt-3 text-sm text-[#5B534C]">
            Thank you for registering for Brand Conversations with BNM. Your
            spot is confirmed.
          </p>

          <motion.a
            href={TELEGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 flex items-center justify-center gap-2.5 rounded-xl bg-[#229ED9] px-6 py-4 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#1a8bbf]"
          >
            <Send className="h-4 w-4" />
            Join the Telegram Group
          </motion.a>

          <div className="mt-4 rounded-xl border border-gray-100 bg-[#FBFBFB] p-4">
            <p className="text-xs leading-relaxed text-[#8A8178]">
              You will be redirected to the Telegram group automatically...
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="flex justify-center"
        >
          <Link
            to="/"
            className="text-sm font-medium text-[#7B2418] underline hover:text-[#5D1F17]"
          >
            Back to registration
          </Link>
        </motion.div>

        <p className="text-center text-xs text-gray-500">
          See you this Sunday, 27 September!
        </p>
      </div>
    </main>
  );
};

export default RegistrationSuccessPage;
