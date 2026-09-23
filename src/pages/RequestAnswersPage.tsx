import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Users, AlertCircle, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Registration } from "@/types/registration";
const RequestAnswersPage = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmailFor, setSendingEmailFor] = useState<string | null>(null);

  const sendConfirmationEmail = async (registration: Registration) => {
    setSendingEmailFor(registration.id);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      setSendingEmailFor(null);
      return;
    }

    try {
      await fetch(`${supabaseUrl}/functions/v1/send-confirmation-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: registration.email,
          first_name: registration.first_name,
          second_name: registration.second_name,
        }),
      });
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
    } finally {
      setSendingEmailFor(null);
    }
  };

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        throw new Error(supabaseError.message);
      }

      setRegistrations(data ?? []);
    } catch (err) {
      console.error("Failed to fetch registrations:", err);

      setError("Unable to load registration responses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();

    // Realtime subscription: push new registrations live
    const channel = supabase
      .channel("registrations-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "registrations",
        },
        (payload) => {
          setRegistrations((prev) => [payload.new as Registration, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRegistrations]);

  const handleRefresh = () => {
    fetchRegistrations();
  };

  return (
    <main className="min-h-screen bg-[#EFEFEF] px-4 py-8 font-sans sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        
        {/* Header Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm border-t-8 border-t-[#4A4A4A]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {/* Brand Logo */}
              <img
                src="/favicon.svg"
                alt="Brand Logo"
                className="mb-3 h-8 w-8 object-contain sm:h-10 sm:w-10"
              />

              <p className="text-xs font-bold uppercase tracking-wider text-[#7B2418]">
                Brand Conversations with BNM
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-tight text-[#1C1815] sm:text-3xl">
                Registration Responses
              </h1>
              <p className="mt-2 text-sm text-[#5B534C]">
                Manage and view all registered attendees and their submitted challenges.
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5D1F17] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#4a1812] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8E8E5] text-[#7B2418]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8A8178]">
              Total Registrations
            </p>
            <p className="text-2xl font-bold text-[#1C1815]">
              {registrations.length}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#7B2418] border-t-transparent"></div>
            <p className="mt-3 text-sm font-medium text-[#5B534C]">
              Fetching responses...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
            <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
            <p className="mt-2 text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 rounded-full bg-[#1C1815] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#7B2418]"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && registrations.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <h2 className="text-base font-semibold text-[#1C1815]">
              No registrations yet
            </h2>
            <p className="mt-1 text-sm text-[#5B534C]">
              Submitted registrations will appear here automatically.
            </p>
          </div>
        )}

        {/* Desktop Table View */}
        {!loading && !error && registrations.length > 0 && (
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#FBFBFB]">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#1C1815]">
                      Name
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#1C1815]">
                      Email
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#1C1815]">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#1C1815]">
                      Country
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#1C1815]">
                      Business / Profession
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#1C1815]">
                      Challenge
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#1C1815]">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#1C1815]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {registrations.map((registration) => (
                    <tr
                      key={registration.id}
                      className="transition-colors hover:bg-gray-50/60"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-[#1C1815]">
                        {registration.first_name} {registration.second_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#5B534C]">
                        {registration.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#5B534C]">
                        {registration.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#5B534C]">
                        {registration.country}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#5B534C]">
                        {registration.business_profession}
                      </td>
                      <td className="max-w-xs px-6 py-4 text-sm">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            registration.has_challenge === "yes"
                              ? "bg-[#F8E8E5] text-[#7B2418]"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {registration.has_challenge === "yes"
                            ? "Has Challenge"
                            : "No Challenge"}
                        </span>
                        {registration.challenge_description && (
                          <p className="mt-1 line-clamp-2 text-xs text-[#5B534C]">
                            {registration.challenge_description}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-xs font-medium text-gray-400">
                        {new Date(registration.created_at).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => sendConfirmationEmail(registration)}
                          disabled={sendingEmailFor === registration.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#F8E8E5] px-3 py-1.5 text-xs font-semibold text-[#7B2418] transition hover:bg-[#7B2418] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {sendingEmailFor === registration.id ? "Sending..." : "Send Email"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mobile Card List View */}
        {!loading && !error && registrations.length > 0 && (
          <div className="space-y-4 md:hidden">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="font-semibold text-[#1C1815]">
                      {registration.first_name} {registration.second_name}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {new Date(registration.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      registration.has_challenge === "yes"
                        ? "bg-[#F8E8E5] text-[#7B2418]"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {registration.has_challenge === "yes"
                      ? "Has Challenge"
                      : "No Challenge"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-gray-400">Email</p>
                    <p className="text-[#1C1815]">{registration.email}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400">Phone</p>
                    <p className="text-[#1C1815]">{registration.phone}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400">Country</p>
                    <p className="text-[#1C1815]">{registration.country}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Business / Profession
                    </p>
                    <p className="text-[#1C1815]">
                      {registration.business_profession}
                    </p>
                  </div>

                  {registration.challenge_description && (
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs font-medium text-gray-400">
                        Challenge Description
                      </p>
                      <p className="mt-1 text-xs text-[#5B534C] leading-relaxed">
                        {registration.challenge_description}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => sendConfirmationEmail(registration)}
                    disabled={sendingEmailFor === registration.id}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#F8E8E5] px-4 py-2 text-xs font-semibold text-[#7B2418] transition hover:bg-[#7B2418] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {sendingEmailFor === registration.id ? "Sending..." : "Send Confirmation Email"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
};

export default RequestAnswersPage;