import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const RegistrationSuccessPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EFEFEF] font-sans">
      <div className="w-full max-w-md space-y-4 px-4 py-12">
        {/* Success Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg"
        >
          {/* Checkmark */}
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

          <div className="mt-6 rounded-xl border border-gray-200 bg-[#FBFBFB] p-5 text-left">
            <p className="text-xs font-medium uppercase tracking-wider text-[#8A8178]">
              To Join the Telegram Group
            </p>

            <p className="mt-2 text-sm leading-relaxed text-[#5B534C]">
              Check your email for the Brand Conversations with BNM invitation
              and Telegram group link.
            </p>

            <p className="mt-3 border-t border-gray-200 pt-3 text-xs leading-relaxed text-[#8A8178]">
              Didn’t see the email? Please check your{" "}
              <span className="font-medium text-[#7B2418]">
                spam or junk folder
              </span>
              .
            </p>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
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
