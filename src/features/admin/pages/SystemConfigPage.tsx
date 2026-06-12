import { useEffect, useRef, useState } from "react";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { adminApi, type AdminStats } from "@/api/adminApi";
import {
    Shield, Mail, Users, Layers, TrendingUp,
    CreditCard, Loader2, CheckCircle2, XCircle, RefreshCw
} from "lucide-react";

const EMAIL_MX_KEY = "email_mx_validation_enabled";

/* ─── Toggle Row ─────────────────────────────────────────────────── */
interface ConfigToggleRowProps {
    id: string;
    label: string;
    description: string;
    warningOff?: string;
    warningOn?: string;
    checked: boolean;
    loading: boolean;
    onChange: (val: boolean) => void;
    icon: React.ReactNode;
}

function ConfigToggleRow({
    id, label, description, warningOff, warningOn,
    checked, loading, onChange, icon,
}: ConfigToggleRowProps) {
    return (
        <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-muted/20">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <Label htmlFor={id} className="text-sm font-semibold cursor-pointer">
                        {label}
                    </Label>
                    {loading ? (
                        <Badge variant="secondary" className="text-xs gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving…
                        </Badge>
                    ) : checked ? (
                        <Badge className="text-xs gap-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Production Mode — ON
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-xs gap-1 text-amber-600 border-amber-400/50 bg-amber-50/50 dark:bg-amber-900/10">
                            <XCircle className="w-3 h-3" />
                            Testing Mode — OFF
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                {!checked && warningOff && (
                    <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                        ⚠ {warningOff}
                    </p>
                )}
                {checked && warningOn && (
                    <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ {warningOn}
                    </p>
                )}
            </div>
            <Switch
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 shrink-0"
            />
        </div>
    );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function SystemConfigPage() {
    const [activeTab, setActiveTab] = useState("config");
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // Email MX Validation
    const [mxEnabled, setMxEnabled] = useState<boolean>(true);
    const [mxLoading, setMxLoading] = useState(false);
    const [mxFetchStatus, setMxFetchStatus] = useState<"loading" | "ready">("loading");
    const fetchedOnce = useRef(false);

    useEffect(() => {
        loadMxValidationState();
    }, []);

    useEffect(() => {
        if (activeTab === "monitoring") loadStats();
    }, [activeTab]);

    /* ── GET current value from backend ── */
    const loadMxValidationState = async () => {
        if (fetchedOnce.current) return;
        setMxFetchStatus("loading");
        try {
            const data = await adminApi.getSystemConfigKey(EMAIL_MX_KEY);
            const val = data?.value;
            if (val === true || val === "true" || val === 1) setMxEnabled(true);
            else if (val === false || val === "false" || val === 0) setMxEnabled(false);
            fetchedOnce.current = true;
        } catch (err: any) {
            console.warn("[SystemConfig] GET /superadmin/config failed:", err?.response?.status);
            fetchedOnce.current = true;
        } finally {
            setMxFetchStatus("ready");
        }
    };

    /* ── PATCH /superadmin/config ── */
    const handleMxToggle = async (newValue: boolean) => {
        if (mxLoading) return;          // prevent double-click
        const previous = mxEnabled;
        setMxEnabled(newValue);         // move toggle immediately
        setMxLoading(true);
        try {
            await adminApi.updateSystemConfigKey(EMAIL_MX_KEY, newValue);
            toast.success(
                newValue
                    ? "✅ Email MX validation enabled — fake emails will now be blocked."
                    : "⚠️ Email MX validation disabled — test emails like test@example.com are now allowed."
            );
        } catch (err: any) {
            setMxEnabled(previous); // rollback on failure
            const status = err?.response?.status;
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to update setting.";
            toast.error(`[HTTP ${status ?? "ERR"}] ${msg}`);
            console.error("[MX Toggle] PATCH failed:", status, err?.response?.data);
        } finally {
            setMxLoading(false);
        }
    };

    const loadStats = async () => {
        setStatsLoading(true);
        try {
            const data = await adminApi.getStats();
            setStats(data);
        } catch {
            toast.error("Failed to load system stats");
        } finally {
            setStatsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="System Configuration"
                description="Manage global system settings and monitoring."
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="config">System Config</TabsTrigger>
                    <TabsTrigger value="security">Security &amp; MFA</TabsTrigger>
                    <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                </TabsList>

                {/* ── System Config Tab ─────────────────────── */}
                <TabsContent value="config" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-primary" />
                                        Email Validation Settings
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Control how the system validates email addresses at registration and sign-up.
                                    </CardDescription>
                                </div>
                                {mxFetchStatus === "ready" && (
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-8 w-8 text-muted-foreground"
                                        title="Refresh current value"
                                        onClick={() => { fetchedOnce.current = false; loadMxValidationState(); }}
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">

                            {mxFetchStatus === "loading" ? (
                                <div className="flex items-center gap-2 py-6 justify-center text-muted-foreground text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading configuration…
                                </div>
                            ) : (
                                <ConfigToggleRow
                                    id="email-mx-validation"
                                    icon={<Mail className="w-5 h-5" />}
                                    label="Email MX Validation"
                                    description="When ON, the backend verifies each email has a valid MX record before allowing registration. Turn OFF only in testing/staging environments."
                                    warningOff="Testing mode active — fake or disposable emails (e.g. test@example.com) will be accepted."
                                    warningOn="Production mode active — only real, deliverable email addresses are accepted."
                                    checked={mxEnabled}
                                    loading={mxLoading}
                                    onChange={handleMxToggle}
                                />
                            )}

                            <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1">How it works</p>
                                <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                                    <li>
                                        <span className="font-semibold text-amber-600">OFF</span> — Testing mode:
                                        fake emails like <code>test@example.com</code> are accepted.
                                    </li>
                                    <li>
                                        <span className="font-semibold text-emerald-600">ON</span> — Production mode:
                                        fake or dead email domains are blocked at sign-up.
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Security Tab ──────────────────────────── */}
                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-primary" />
                                Security Settings
                            </CardTitle>
                            <CardDescription>Manage MFA and security policies.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 opacity-60">
                                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <Label className="text-sm font-semibold">Enforce MFA for all Admins</Label>
                                        <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Require all admin accounts to set up two-factor authentication.
                                    </p>
                                </div>
                                <Switch id="mfa-enforce" disabled className="mt-0.5 shrink-0" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Monitoring Tab ────────────────────────── */}
                <TabsContent value="monitoring" className="space-y-4">
                    {statsLoading ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading stats…
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {[
                                { label: "Total Users", value: stats?.totalUsers ?? 0, icon: <Users className="w-4 h-4 text-primary" /> },
                                { label: "Active Clients", value: stats?.totalClients ?? 0, icon: <Layers className="w-4 h-4 text-primary" /> },
                                { label: "Total MRR", value: `₹${stats?.mrr ?? 0}`, icon: <TrendingUp className="w-4 h-4 text-primary" /> },
                                { label: "Active Subscriptions", value: stats?.activeSubscriptions ?? 0, icon: <CreditCard className="w-4 h-4 text-primary" /> },
                            ].map((stat) => (
                                <Card key={stat.label}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                                        {stat.icon}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stat.value}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
