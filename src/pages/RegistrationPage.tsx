import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import bimpeImg from "../assets/bimpe.png";

interface FormData {
  firstName: string;
  secondName: string;
  email: string;
  phone: string;
  country: string;
  businessProfession: string;
  hasChallenge: string;
  challengeDescription: string;
}

interface FormErrors {
  firstName?: string;
  secondName?: string;
  email?: string;
  phone?: string;
  country?: string;
  businessProfession?: string;
  hasChallenge?: string;
}

const RegistrationPage = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    secondName: "",
    email: "",
    phone: "",
    country: "",
    businessProfession: "",
    hasChallenge: "",
    challengeDescription: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    setSubmitError(null);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!formData.secondName.trim()) {
      newErrors.secondName = "Second name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (
      /^\+?[0-9\s\-()]{7,20}$/.test(formData.phone.trim()) === false
    ) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required.";
    }

    if (!formData.businessProfession.trim()) {
      newErrors.businessProfession =
        "Business or profession is required.";
    }

    if (!formData.hasChallenge) {
      newErrors.hasChallenge = "Please select an option.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitError(null);

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setSubmitting(true);

    try {
      /*
       * Only insert the registration here.
       *
       * The Supabase database trigger:
       *
       * registrations
       *      ↓
       * trg_registration_email
       *      ↓
       * notify_registration_email()
       *      ↓
       * send-confirmation-mail
       *      ↓
       * Gmail
       *
       * handles the confirmation email automatically.
       */

      const { error: supabaseError } = await supabase
        .from("registrations")
        .insert({
          first_name: formData.firstName.trim(),
          second_name: formData.secondName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          country: formData.country.trim(),
          business_profession:
            formData.businessProfession.trim(),
          has_challenge: formData.hasChallenge,
          challenge_description:
            formData.challengeDescription.trim() || null,
        });

      if (supabaseError) {
        console.error(
          "Supabase registration insert error:",
          supabaseError
        );

        setSubmitError(
          "Something went wrong submitting your registration. Please try again."
        );

        return;
      }

      /*
       * Registration was successfully inserted.
       *
       * The database trigger now handles the email.
       */

      navigate("/registration-success", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Registration submission error:",
        error
      );

      setSubmitError(
        "Something went wrong submitting your registration. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#EFEFEF] px-4 py-8 font-sans sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-2xl space-y-4">

        {/* Banner Image */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <img
            src={bimpeImg}
            alt="Brand Conversations with BNM"
            className="h-auto w-full object-cover"
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4"
        >

          {/* Header */}
          <div className="overflow-hidden rounded-xl border border-gray-200 border-t-8 border-t-[#4A4A4A] bg-white p-6 shadow-sm">
            <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-[#1C1815] sm:text-3xl">
              Brand Conversations with BNM
            </h1>

            <p className="mt-3 text-sm text-[#5B534C]">
              Tell us a little about yourself and your brand. We look
              forward to connecting with you.
            </p>

            <hr className="my-4 border-gray-100" />

            <p className="text-xs text-red-600">
              * Indicates required question
            </p>
          </div>

          {/* First Name */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="firstName"
              className="mb-3 block text-sm font-medium text-[#1C1815]"
            >
              First Name <span className="text-red-600">*</span>
            </label>

            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Your answer"
              className={`w-full border-b pb-1 text-sm outline-none transition focus:border-b-2 focus:border-[#7B2418] ${
                errors.firstName
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {errors.firstName && (
              <p className="mt-2 text-xs text-red-600">
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Second Name */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="secondName"
              className="mb-3 block text-sm font-medium text-[#1C1815]"
            >
              Second Name <span className="text-red-600">*</span>
            </label>

            <input
              id="secondName"
              name="secondName"
              type="text"
              value={formData.secondName}
              onChange={handleChange}
              placeholder="Your answer"
              className={`w-full border-b pb-1 text-sm outline-none transition focus:border-b-2 focus:border-[#7B2418] ${
                errors.secondName
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {errors.secondName && (
              <p className="mt-2 text-xs text-red-600">
                {errors.secondName}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="email"
              className="mb-3 block text-sm font-medium text-[#1C1815]"
            >
              Email address <span className="text-red-600">*</span>
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your answer"
              className={`w-full border-b pb-1 text-sm outline-none transition focus:border-b-2 focus:border-[#7B2418] ${
                errors.email
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {errors.email && (
              <p className="mt-2 text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="phone"
              className="mb-1 block text-sm font-medium text-[#1C1815]"
            >
              Phone number <span className="text-red-600">*</span>
            </label>

            <p className="mb-3 text-xs text-gray-500">
              Please include your country code.
            </p>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your answer"
              className={`w-full border-b pb-1 text-sm outline-none transition focus:border-b-2 focus:border-[#7B2418] ${
                errors.phone
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {errors.phone && (
              <p className="mt-2 text-xs text-red-600">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Country */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="country"
              className="mb-3 block text-sm font-medium text-[#1C1815]"
            >
              Country <span className="text-red-600">*</span>
            </label>

            <input
              id="country"
              name="country"
              type="text"
              value={formData.country}
              onChange={handleChange}
              placeholder="Your answer"
              className={`w-full border-b pb-1 text-sm outline-none transition focus:border-b-2 focus:border-[#7B2418] ${
                errors.country
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {errors.country && (
              <p className="mt-2 text-xs text-red-600">
                {errors.country}
              </p>
            )}
          </div>

          {/* Business / Profession */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="businessProfession"
              className="mb-3 block text-sm font-medium text-[#1C1815]"
            >
              Business / Profession{" "}
              <span className="text-red-600">*</span>
            </label>

            <input
              id="businessProfession"
              name="businessProfession"
              type="text"
              value={formData.businessProfession}
              onChange={handleChange}
              placeholder="Your answer"
              className={`w-full border-b pb-1 text-sm outline-none transition focus:border-b-2 focus:border-[#7B2418] ${
                errors.businessProfession
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {errors.businessProfession && (
              <p className="mt-2 text-xs text-red-600">
                {errors.businessProfession}
              </p>
            )}
          </div>

          {/* Challenge */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <fieldset>
              <legend className="mb-4 text-sm font-medium text-[#1C1815]">
                Are you currently facing any challenge with your
                business / brand?{" "}
                <span className="text-red-600">*</span>
              </legend>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-[#1C1815]">
                  <input
                    type="radio"
                    name="hasChallenge"
                    value="yes"
                    checked={
                      formData.hasChallenge === "yes"
                    }
                    onChange={handleChange}
                    className="h-4 w-4 cursor-pointer accent-[#7B2418]"
                  />
                  Yes
                </label>

                <label className="flex cursor-pointer items-center gap-3 text-sm text-[#1C1815]">
                  <input
                    type="radio"
                    name="hasChallenge"
                    value="no"
                    checked={
                      formData.hasChallenge === "no"
                    }
                    onChange={handleChange}
                    className="h-4 w-4 cursor-pointer accent-[#7B2418]"
                  />
                  No
                </label>
              </div>

              {errors.hasChallenge && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.hasChallenge}
                </p>
              )}
            </fieldset>
          </div>

          {/* Challenge Description */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="challengeDescription"
              className="mb-3 block text-sm font-medium text-[#1C1815]"
            >
              If yes, kindly describe the challenge
            </label>

            <textarea
              id="challengeDescription"
              name="challengeDescription"
              value={formData.challengeDescription}
              onChange={handleChange}
              rows={3}
              placeholder="Your answer"
              className="w-full resize-y border-b border-gray-300 pb-1 text-sm outline-none transition focus:border-b-2 focus:border-[#7B2418]"
            />
          </div>

          {/* Submit */}
          <div className="border-t border-black/10 pt-7">
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#5D1F17] py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition-colors duration-200 hover:bg-[#4a1812] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "SUBMIT"}

              <ArrowUpRight className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Error */}
          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-800">
              {submitError}
            </div>
          )}
        </form>

        <p className="pt-4 text-center text-xs text-gray-500">
          Your information will be kept private and used only for
          this registration.
        </p>
      </div>
    </main>
  );
};

export default RegistrationPage;
