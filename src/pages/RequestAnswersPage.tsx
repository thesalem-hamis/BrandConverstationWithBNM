import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Registration } from "@/types/registration";

const RequestAnswersPage = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "challenge" | "no-challenge">(
    "all"
  );

  const [sendingEmailFor, setSendingEmailFor] = useState<string | null>(null);
  const [emailSuccessFor, setEmailSuccessFor] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState("CONNECTING");

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        console.error("[Registrations] Query error:", supabaseError);
        throw new Error(
          supabaseError.message ||
            "Unable to fetch registration responses."
        );
      }

      setRegistrations((data ?? []) as Registration[]);
    } catch (err) {
      console.error("[Registrations] Fetch failed:", err);

      setRegistrations([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load registration responses."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const sendConfirmationEmail = async (
    registration: Registration
  ) => {
    setSendingEmailFor(registration.id);
    setEmailSuccessFor(null);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      alert("Supabase configuration is missing.");
      setSendingEmailFor(null);
      return;
    }

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-confirmation-mail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            template: "registration",
            data: {
              email: registration.email,
              first_name: registration.first_name,
              second_name: registration.second_name,
            },
          }),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ||
            result?.message ||
            `Email request failed with status ${response.status}.`
        );
      }

      setEmailSuccessFor(registration.id);

      window.setTimeout(() => {
        setEmailSuccessFor((current) =>
          current === registration.id ? null : current
        );
      }, 3000);
    } catch (err) {
      console.error("[Email] Failed:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to send confirmation email."
      );
    } finally {
      setSendingEmailFor(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    fetchRegistrations();

    const channel = supabase
      .channel("registrations-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "registrations",
        },
        (payload) => {
          const newRegistration = payload.new as Registration;

          if (!mounted) return;

          setRegistrations((current) => {
            const exists = current.some(
              (item) => item.id === newRegistration.id
            );

            if (exists) return current;

            return [newRegistration, ...current];
          });
        }
      )
      .subscribe((status) => {
        if (mounted) {
          setRealtimeStatus(status);
        }
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [fetchRegistrations]);

  const filteredRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return registrations.filter((registration) => {
      const matchesSearch =
        !query ||
        `${registration.first_name} ${registration.second_name}`
          .toLowerCase()
          .includes(query) ||
        registration.email.toLowerCase().includes(query) ||
        registration.phone.toLowerCase().includes(query) ||
        registration.country.toLowerCase().includes(query) ||
        registration.business_profession.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "challenge" &&
          registration.has_challenge === "yes") ||
        (filter === "no-challenge" &&
          registration.has_challenge === "no");

      return matchesSearch && matchesFilter;
    });
  }, [registrations, search, filter]);

  const challengeCount = registrations.filter(
    (registration) => registration.has_challenge === "yes"
  ).length;

  const noChallengeCount = registrations.filter(
    (registration) => registration.has_challenge === "no"
  ).length;

  return (
    <main className="min-h-screen bg-[#F5F4F2] px-3 py-4 font-sans sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-4">

        {/* HEADER */}
        <section className="rounded-[22px] border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#E9DDD9] bg-[#FBF5F3]">
                <img
                  src="/favicon.svg"
                  alt="Brand Conversations"
                  className="h-7 w-7 object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7B2418]">
                  Brand Conversations with BNM
                </p>

                <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-[#211C19] sm:text-2xl">
                  Registration Responses
                </h1>

                <p className="mt-1 text-xs text-[#817A74] sm:text-sm">
                  View and manage submitted attendee information.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`hidden items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold sm:flex ${
                  realtimeStatus === "SUBSCRIBED"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    realtimeStatus === "SUBSCRIBED"
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                />

                {realtimeStatus === "SUBSCRIBED"
                  ? "Live"
                  : "Connecting"}
              </div>

              <button
                type="button"
                onClick={fetchRegistrations}
                disabled={loading}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#5D1F17] px-4 text-xs font-semibold text-white transition hover:bg-[#481710] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    loading ? "animate-spin" : ""
                  }`}
                />

                <span className="hidden sm:inline">
                  {loading ? "Refreshing" : "Refresh"}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">

          <div className="rounded-[18px] border border-black/[0.06] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.03)] sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8E8E5] text-[#7B2418]">
                <Users className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#99918A]">
                  Total
                </p>

                <p className="mt-0.5 text-2xl font-bold text-[#211C19]">
                  {registrations.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-black/[0.06] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.03)] sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F2ED] text-[#8A5A35]">
                <MessageSquare className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#99918A]">
                  Challenges
                </p>

                <p className="mt-0.5 text-2xl font-bold text-[#211C19]">
                  {challengeCount}
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-2 rounded-[18px] border border-black/[0.06] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.03)] sm:p-5 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F4F1] text-[#55705A]">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#99918A]">
                  No Challenge
                </p>

                <p className="mt-0.5 text-2xl font-bold text-[#211C19]">
                  {noChallengeCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH + FILTER */}
        {!loading && !error && registrations.length > 0 && (
          <section className="rounded-[18px] border border-black/[0.06] bg-white p-3 shadow-[0_5px_20px_rgba(0,0,0,0.03)] sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#AAA39D]" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email, phone..."
                  className="h-10 w-full rounded-xl border border-[#E7E3DF] bg-[#FAFAF9] pl-10 pr-4 text-xs text-[#211C19] outline-none transition placeholder:text-[#AAA39D] focus:border-[#B88B81] focus:bg-white focus:ring-2 focus:ring-[#7B2418]/10"
                />
              </div>

              <div className="relative">
                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(
                      event.target.value as
                        | "all"
                        | "challenge"
                        | "no-challenge"
                    )
                  }
                  className="h-10 w-full appearance-none rounded-xl border border-[#E7E3DF] bg-[#FAFAF9] pl-3 pr-9 text-xs font-medium text-[#4E4843] outline-none focus:border-[#B88B81] sm:w-48"
                >
                  <option value="all">All registrations</option>
                  <option value="challenge">
                    Has challenge
                  </option>
                  <option value="no-challenge">
                    No challenge
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8E8780]" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#F1EFEC] pt-3">
              <p className="text-[11px] text-[#918A84]">
                Showing{" "}
                <span className="font-semibold text-[#514B46]">
                  {filteredRegistrations.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#514B46]">
                  {registrations.length}
                </span>{" "}
                registrations
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-[11px] font-semibold text-[#7B2418] hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          </section>
        )}

        {/* LOADING */}
        {loading && (
          <section className="rounded-[20px] border border-black/[0.06] bg-white px-6 py-16 text-center shadow-[0_5px_20px_rgba(0,0,0,0.03)]">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#7B2418]" />

            <p className="mt-4 text-xs font-medium text-[#77706A]">
              Loading registration responses...
            </p>
          </section>
        )}

        {/* ERROR */}
        {!loading && error && (
          <section className="rounded-[20px] border border-red-200 bg-white p-10 text-center shadow-[0_5px_20px_rgba(0,0,0,0.03)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-sm font-bold text-[#211C19]">
              Unable to load registrations
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-[#817A74]">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchRegistrations}
              className="mt-5 rounded-xl bg-[#5D1F17] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#481710]"
            >
              Try Again
            </button>
          </section>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          registrations.length === 0 && (
            <section className="rounded-[20px] border border-black/[0.06] bg-white p-14 text-center shadow-[0_5px_20px_rgba(0,0,0,0.03)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8E8E5] text-[#7B2418]">
                <Users className="h-6 w-6" />
              </div>

              <h2 className="mt-4 text-sm font-bold text-[#211C19]">
                No registrations yet
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#817A74]">
                Submitted registrations will appear here
                automatically.
              </p>
            </section>
          )}

        {/* NO SEARCH RESULTS */}
        {!loading &&
          !error &&
          registrations.length > 0 &&
          filteredRegistrations.length === 0 && (
            <section className="rounded-[20px] border border-black/[0.06] bg-white p-12 text-center shadow-[0_5px_20px_rgba(0,0,0,0.03)]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6F4F2] text-[#827A73]">
                <Search className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-sm font-bold text-[#211C19]">
                No matching registrations
              </h2>

              <p className="mt-2 text-xs text-[#817A74]">
                Try another name, email, phone number or filter.
              </p>
            </section>
          )}

        {/* DESKTOP TABLE */}
        {!loading &&
          !error &&
          filteredRegistrations.length > 0 && (
            <section className="hidden overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-[0_5px_20px_rgba(0,0,0,0.04)] md:block">

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] border-collapse">

                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-[#EDEAE7] bg-[#FAF9F7]">

                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#817A74]">
                        Attendee
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#817A74]">
                        Contact
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#817A74]">
                        Location
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#817A74]">
                        Business / Profession
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#817A74]">
                        Challenge
                      </th>

                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#817A74]">
                        Registered
                      </th>

                      <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-[#817A74]">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#F1EFEC]">

                    {filteredRegistrations.map(
                      (registration) => (
                        <tr
                          key={registration.id}
                          className="group transition-colors hover:bg-[#FCFBFA]"
                        >

                          {/* ATTENDEE */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8E8E5] text-xs font-bold text-[#7B2418]">
                                {registration.first_name
                                  ?.charAt(0)
                                  .toUpperCase()}
                                {registration.second_name
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-[#211C19]">
                                  {registration.first_name}{" "}
                                  {registration.second_name}
                                </p>

                                <p className="mt-0.5 text-[10px] text-[#A19A94]">
                                  Attendee
                                </p>
                              </div>

                            </div>
                          </td>

                          {/* CONTACT */}
                          <td className="px-5 py-4">
                            <div className="space-y-1">

                              <div className="flex items-center gap-1.5">
                                <Mail className="h-3 w-3 text-[#9B938C]" />

                                <span className="max-w-[220px] truncate text-[11px] text-[#5E5751]">
                                  {registration.email}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-[#9B938C]" />

                                <span className="text-[11px] text-[#817A74]">
                                  {registration.phone}
                                </span>
                              </div>

                            </div>
                          </td>

                          {/* LOCATION */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 text-[#9B938C]" />

                              <span className="text-[11px] text-[#5E5751]">
                                {registration.country}
                              </span>
                            </div>
                          </td>

                          {/* BUSINESS */}
                          <td className="max-w-[210px] px-5 py-4">
                            <div className="flex gap-1.5">
                              <BriefcaseBusiness className="mt-0.5 h-3 w-3 shrink-0 text-[#9B938C]" />

                              <span className="line-clamp-2 text-[11px] leading-4 text-[#5E5751]">
                                {
                                  registration.business_profession
                                }
                              </span>
                            </div>
                          </td>

                          {/* CHALLENGE */}
                          <td className="max-w-[260px] px-5 py-4">

                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
                                registration.has_challenge ===
                                "yes"
                                  ? "bg-[#F8E8E5] text-[#7B2418]"
                                  : "bg-[#F1F2F1] text-[#687069]"
                              }`}
                            >
                              {registration.has_challenge ===
                              "yes"
                                ? "Has Challenge"
                                : "No Challenge"}
                            </span>

                            {registration.challenge_description && (
                              <p className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-[#817A74]">
                                {
                                  registration.challenge_description
                                }
                              </p>
                            )}

                          </td>

                          {/* DATE */}
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex items-center gap-1.5 text-[10px] text-[#8D857F]">
                              <CalendarDays className="h-3 w-3" />

                              {new Date(
                                registration.created_at
                              ).toLocaleDateString(
                                undefined,
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </div>
                          </td>

                          {/* ACTION */}
                          <td className="px-5 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                sendConfirmationEmail(
                                  registration
                                )
                              }
                              disabled={
                                sendingEmailFor ===
                                registration.id
                              }
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-bold transition ${
                                emailSuccessFor ===
                                registration.id
                                  ? "bg-green-50 text-green-700"
                                  : "bg-[#F8E8E5] text-[#7B2418] hover:bg-[#7B2418] hover:text-white"
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                            >

                              {sendingEmailFor ===
                              registration.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : emailSuccessFor ===
                                registration.id ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <Mail className="h-3 w-3" />
                              )}

                              {sendingEmailFor ===
                              registration.id
                                ? "Sending"
                                : emailSuccessFor ===
                                  registration.id
                                ? "Sent"
                                : "Email"}

                            </button>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>
                </table>
              </div>
            </section>
          )}

        {/* MOBILE CARDS */}
        {!loading &&
          !error &&
          filteredRegistrations.length > 0 && (
            <section className="space-y-3 md:hidden">

              {filteredRegistrations.map(
                (registration) => (
                  <article
                    key={registration.id}
                    className="overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-[0_5px_20px_rgba(0,0,0,0.04)]"
                  >

                    {/* CARD HEADER */}
                    <div className="flex items-center justify-between gap-3 border-b border-[#F1EFEC] p-4">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8E8E5] text-xs font-bold text-[#7B2418]">
                          {registration.first_name
                            ?.charAt(0)
                            .toUpperCase()}
                          {registration.second_name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-bold text-[#211C19]">
                            {registration.first_name}{" "}
                            {registration.second_name}
                          </h2>

                          <p className="mt-0.5 text-[10px] text-[#9B938C]">
                            {new Date(
                              registration.created_at
                            ).toLocaleDateString(
                              undefined,
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>

                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
                          registration.has_challenge ===
                          "yes"
                            ? "bg-[#F8E8E5] text-[#7B2418]"
                            : "bg-[#F1F2F1] text-[#687069]"
                        }`}
                      >
                        {registration.has_challenge ===
                        "yes"
                          ? "Challenge"
                          : "No Challenge"}
                      </span>

                    </div>

                    {/* CARD CONTENT */}
                    <div className="p-4">

                      <div className="grid grid-cols-1 gap-3">

                        <div className="rounded-xl bg-[#FAF9F7] p-3">
                          <div className="flex items-start gap-2.5">

                            <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7B2418]" />

                            <div className="min-w-0">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-[#A19A94]">
                                Email
                              </p>

                              <p className="mt-1 break-all text-xs text-[#3F3935]">
                                {registration.email}
                              </p>
                            </div>

                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">

                          <div className="rounded-xl bg-[#FAF9F7] p-3">
                            <div className="flex gap-2">

                              <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7B2418]" />

                              <div className="min-w-0">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-[#A19A94]">
                                  Phone
                                </p>

                                <p className="mt-1 break-all text-xs text-[#3F3935]">
                                  {registration.phone}
                                </p>
                              </div>

                            </div>
                          </div>

                          <div className="rounded-xl bg-[#FAF9F7] p-3">
                            <div className="flex gap-2">

                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7B2418]" />

                              <div className="min-w-0">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-[#A19A94]">
                                  Country
                                </p>

                                <p className="mt-1 truncate text-xs text-[#3F3935]">
                                  {registration.country}
                                </p>
                              </div>

                            </div>
                          </div>

                        </div>

                        <div className="rounded-xl bg-[#FAF9F7] p-3">
                          <div className="flex gap-2.5">

                            <BriefcaseBusiness className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7B2418]" />

                            <div className="min-w-0">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-[#A19A94]">
                                Business / Profession
                              </p>

                              <p className="mt-1 text-xs leading-5 text-[#3F3935]">
                                {
                                  registration.business_profession
                                }
                              </p>
                            </div>

                          </div>
                        </div>

                        {registration.challenge_description && (
                          <div className="rounded-xl border border-[#EDE4E1] bg-[#FCF8F7] p-3">
                            <div className="flex gap-2.5">

                              <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7B2418]" />

                              <div className="min-w-0">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-[#A19A94]">
                                  Challenge Description
                                </p>

                                <p className="mt-1 text-xs leading-5 text-[#514A45]">
                                  {
                                    registration.challenge_description
                                  }
                                </p>
                              </div>

                            </div>
                          </div>
                        )}

                      </div>

                      {/* EMAIL BUTTON */}
                      <button
                        type="button"
                        onClick={() =>
                          sendConfirmationEmail(
                            registration
                          )
                        }
                        disabled={
                          sendingEmailFor ===
                          registration.id
                        }
                        className={`mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold transition ${
                          emailSuccessFor ===
                          registration.id
                            ? "bg-green-50 text-green-700"
                            : "bg-[#5D1F17] text-white hover:bg-[#481710]"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >

                        {sendingEmailFor ===
                        registration.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : emailSuccessFor ===
                          registration.id ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Mail className="h-3.5 w-3.5" />
                        )}

                        {sendingEmailFor ===
                        registration.id
                          ? "Sending confirmation..."
                          : emailSuccessFor ===
                            registration.id
                          ? "Confirmation email sent"
                          : "Send confirmation email"}

                      </button>

                    </div>
                  </article>
                )
              )}

            </section>
          )}

      </div>
    </main>
  );
};

export default RequestAnswersPage;