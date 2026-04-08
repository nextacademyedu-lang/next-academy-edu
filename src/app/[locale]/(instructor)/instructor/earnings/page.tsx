"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  getInstructorEarnings,
  getInstructorProfile,
  getEarningStudentName,
  getEarningTypeTitle,
  getEarningDuration,
  getEarningDate,
  type PayloadEarning,
} from "@/lib/instructor-api";
import styles from "./earnings.module.css";

type FilterStatus = "all" | "paid" | "pending" | "refunded";

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  paid:     { color: "#C51B1B", bg: "rgba(197,27,27,0.12)",   label: "Paid"     },
  pending:  { color: "#D6A32B", bg: "rgba(214,163,43,0.14)",  label: "Pending"  },
  refunded: { color: "#8F9A8F", bg: "rgba(143,154,143,0.16)", label: "Refunded" },
};

function formatEGP(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function InstructorEarningsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  const [earnings, setEarnings] = useState<PayloadEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [revenueShares, setRevenueShares] = useState({ course: 33, consultation: 50 });

  // Auth guard — instructor or admin only
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
    if (!isLoading && user && user.role !== "instructor" && user.role !== "admin") {
      router.push(`/${locale}/dashboard`);
    }
  }, [isLoading, isAuthenticated, user, router, locale]);

  useEffect(() => {
    getInstructorEarnings().then((res) => {
      if (res.success && res.data) setEarnings(res.data.docs);
      setLoading(false);
    });
    // Fetch instructor revenue shares
    getInstructorProfile().then((res) => {
      if (res.success && res.data?.profile) {
        const p = res.data.profile as any;
        setRevenueShares({
          course: p.courseRevenueShare ?? 33,
          consultation: p.consultationRevenueShare ?? 50,
        });
      }
    });
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const paid     = earnings.filter((e) => e.paymentStatus === "paid");
    const pending  = earnings.filter((e) => e.paymentStatus === "pending");
    const thisMonth = paid.filter((e) => getMonthKey(getEarningDate(e)) === getMonthKey(new Date().toISOString()));

    const totalRevenue = paid.reduce((s, e) => s + e.amount, 0);
    const yourShare    = totalRevenue * (revenueShares.consultation / 100);
    const thisMonthRevenue = thisMonth.reduce((s, e) => s + e.amount, 0);
    const thisMonthShare   = thisMonthRevenue * (revenueShares.consultation / 100);

    return {
      totalEarned:   totalRevenue,
      yourShare,
      pendingAmount: pending.reduce((s, e) => s + e.amount, 0),
      thisMonth:     thisMonthRevenue,
      thisMonthShare,
      totalSessions: earnings.length,
    };
  }, [earnings, revenueShares]);

  // ── Filter + Search ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return earnings.filter((e) => {
      const matchStatus =
        filterStatus === "all" || e.paymentStatus === filterStatus;
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        getEarningStudentName(e).toLowerCase().includes(q) ||
        getEarningTypeTitle(e).toLowerCase().includes(q) ||
        e.bookingCode?.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [earnings, query, filterStatus]);

  const STAT_CARDS = [
    {
      label: "Total Revenue",
      value: formatEGP(stats.totalEarned),
      icon: DollarSign,
      color: "#C51B1B",
    },
    {
      label: `Your Share (${revenueShares.consultation}%)`,
      value: formatEGP(stats.yourShare),
      icon: TrendingUp,
      color: "#22c55e",
    },
    {
      label: "This Month",
      value: formatEGP(stats.thisMonth),
      icon: TrendingUp,
      color: "#D6A32B",
    },
    {
      label: "Pending Payout",
      value: formatEGP(stats.pendingAmount),
      icon: Clock,
      color: "#8F9A8F",
    },
    {
      label: "Total Sessions",
      value: stats.totalSessions,
      icon: CheckCircle2,
      color: "#C51B1B",
    },
  ];

  if (isLoading) return null;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Earnings</h1>
          <p className={styles.subtitle}>
            Track your consultation revenue and payout history.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className={styles.statCard}>
              <div
                className={styles.statGlow}
                style={{ background: `radial-gradient(circle at top right, ${s.color}20, transparent 70%)` }}
              />
              <CardContent className={styles.statContent}>
                <div className={styles.statTop}>
                  <span className={styles.statLabel}>{s.label}</span>
                  <div className={styles.statIcon} style={{ backgroundColor: `${s.color}15` }}>
                    <Icon size={20} color={s.color} />
                  </div>
                </div>
                <div className={styles.statValue}>
                  {loading ? "—" : s.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <Input
            placeholder="Search student, service, or ref..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterBtns}>
          <Filter size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          {(["all", "paid", "pending", "refunded"] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`${styles.filterBtn} ${filterStatus === s ? styles.filterBtnActive : ""}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Cards */}
      {loading ? (
        <p className={styles.empty}>Loading…</p>
      ) : filtered.length === 0 ? (
        <Card className={styles.emptyCard}>
          <CardContent className={styles.emptyContent}>
            <XCircle size={40} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
              {query || filterStatus !== "all" ? "No results match your filters." : "No earnings recorded yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className={styles.tableCard}>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</CardDescription>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.tableHead}>
                      {["Date", "Student", "Service", "Duration", "Amount", "Your Share", "Status"].map((h) => (
                        <th key={h} className={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => {
                      const st = STATUS_STYLE[e.paymentStatus] ?? STATUS_STYLE.pending;
                      return (
                        <tr key={e.id} className={styles.tableRow}>
                          <td className={styles.td} style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                            {getEarningDate(e)}
                          </td>
                          <td className={styles.td}>
                            <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                              {getEarningStudentName(e)}
                            </div>
                            {e.bookingCode && (
                              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                #{e.bookingCode}
                              </div>
                            )}
                          </td>
                          <td className={styles.td} style={{ color: "var(--text-secondary)" }}>
                            {getEarningTypeTitle(e)}
                          </td>
                          <td className={styles.td} style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                            {getEarningDuration(e) > 0 ? `${getEarningDuration(e)} min` : "—"}
                          </td>
                          <td className={styles.td} style={{ fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                            {formatEGP(e.amount)}
                            {e.discountAmount > 0 && (
                              <span style={{ fontSize: "12px", color: "var(--accent-gold)", marginLeft: "6px" }}>
                                -{formatEGP(e.discountAmount)}
                              </span>
                            )}
                          </td>
                          <td className={styles.td} style={{ fontWeight: 600, color: "#22c55e", whiteSpace: "nowrap" }}>
                            {formatEGP(e.amount * (revenueShares.consultation / 100))}
                          </td>
                          <td className={styles.td}>
                            <span
                              className={styles.badge}
                              style={{ color: st.color, backgroundColor: st.bg }}
                            >
                              {st.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Cards */}
          <div className={styles.mobileList}>
            {filtered.map((e) => {
              const st = STATUS_STYLE[e.paymentStatus] ?? STATUS_STYLE.pending;
              return (
                <Card key={e.id} className={styles.mobileCard}>
                  <CardContent className={styles.mobileCardContent}>
                    <div className={styles.mobileCardTop}>
                      <div>
                        <div className={styles.mobileCardName}>{getEarningStudentName(e)}</div>
                        <div className={styles.mobileCardSub}>{getEarningTypeTitle(e)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className={styles.mobileCardAmount}>{formatEGP(e.amount)}</div>
                        <span className={styles.badge} style={{ color: st.color, backgroundColor: st.bg }}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                    <div className={styles.mobileCardMeta}>
                      <span>{getEarningDate(e)}</span>
                      {getEarningDuration(e) > 0 && <span>{getEarningDuration(e)} min</span>}
                      {e.bookingCode && <span>#{e.bookingCode}</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
