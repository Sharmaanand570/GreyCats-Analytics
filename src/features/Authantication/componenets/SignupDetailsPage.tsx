import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { userApi } from "@/api/userApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, ChevronRight, Building2, Globe, Check } from "lucide-react";
// Actually I'll check if specific utils exist, usually "@/lib/utils" or "@/utils/utils". App uses "@/components/ui/button" which usually uses "cn" from "@/lib/utils".
// I'll assume standard shadcn structure or standard imports.
// To be safe I'll just strictly use dependencies or minimal utils.

// ---------------------------
// SCHEMAS
// ---------------------------

const step1Schema = z.object({
    jobTitle: z.string().min(1, "Job Title is required"),
    companyName: z.string().min(1, "Company Name is required"),
});

const step3Schema = z.object({
    website: z.string().optional().or(z.literal("")),
    streetAddress: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pin: z.string().optional(),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step3Values = z.infer<typeof step3Schema>;

export default function SignupDetailsPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);

    // STEP 1 FORM
    const form1 = useForm<Step1Values>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            jobTitle: "",
            companyName: "",
        },
    });

    // STEP 3 FORM
    const form3 = useForm<Step3Values>({
        resolver: zodResolver(step3Schema),
        defaultValues: {
            website: "",
            streetAddress: "",
            city: "Mumbai",
            state: "Maharashtra",
            country: "India",
            pin: "",
        },
    });

    // ---------------------------
    // HANDLERS
    // ---------------------------

    const onStep1Submit = async (data: Step1Values) => {
        setLoading(true);
        try {
            await userApi.updateProfile({
                jobTitle: data.jobTitle,
                companyName: data.companyName,
            });
            toast.success("Details saved!");
            setStep(2);
        } catch (error) {
            toast.error("Failed to save details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large! Max 5MB");
            return;
        }

        setLoading(true);
        try {
            await userApi.uploadCompanyLogo(file);
            toast.success("Logo uploaded!");
            setStep(3);
        } catch (error) {
            toast.error("Failed to upload logo.");
        } finally {
            setLoading(false);
        }
    };

    const onStep3Submit = async (data: Step3Values) => {
        setLoading(true);
        try {
            await userApi.updateProfile({
                companyWebsite: data.website,
                companyStreetAddress: data.streetAddress,
                companyCity: data.city,
                companyState: data.state,
                companyCountry: data.country,
                companyPIN: data.pin,
            });
            toast.success("All set!");
            navigate("/"); // Redirect to Dashboard
        } catch (error) {
            toast.error("Failed to save address details.");
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        if (step === 2) setStep(3);
        else if (step === 3) navigate("/");
    };

    // ---------------------------
    // RENDER
    // ---------------------------

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-lg space-y-8">

                {/* Header / Progress */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Setup your profile</h1>
                    <p className="text-muted-foreground">
                        Step {step} of 3 • {step === 1 ? "Professional Info" : step === 2 ? "Company Branding" : "Location Details"}
                    </p>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mt-4">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                <Card className="shadow-lg border-muted/40">
                    <CardContent className="pt-6">

                        {/* STEP 1: JOB INFO */}
                        {step === 1 && (
                            <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="jobTitle">Job Title <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="jobTitle"
                                                placeholder="e.g. Product Manager"
                                                className="pl-10 h-10"
                                                {...form1.register("jobTitle")}
                                            />
                                        </div>
                                        {form1.formState.errors.jobTitle && (
                                            <p className="text-xs text-red-500">{form1.formState.errors.jobTitle.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="companyName"
                                                placeholder="e.g. Acme Corp"
                                                className="pl-10 h-10"
                                                {...form1.register("companyName")}
                                            />
                                        </div>
                                        {form1.formState.errors.companyName && (
                                            <p className="text-xs text-red-500">{form1.formState.errors.companyName.message}</p>
                                        )}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-11" disabled={loading}>
                                    {loading ? "Saving..." : "Continue"}
                                    {!loading && <ChevronRight className="ml-2 h-4 w-4" />}
                                </Button>
                            </form>
                        )}

                        {/* STEP 2: LOGO */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center space-y-2">
                                    <div className="mx-auto h-24 w-24 rounded-full bg-secondary/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Upload Company Logo</h3>
                                        <p className="text-xs text-muted-foreground">Recommended size: 500x500px</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={loading}
                                        />
                                        <Button
                                            type="button"
                                            variant="default"
                                            className="w-full h-11"
                                            disabled={loading}
                                            onClick={() => document.getElementById('logo-upload')?.click()}
                                        >
                                            {loading ? "Uploading..." : "Select Image"}
                                        </Button>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full"
                                        onClick={handleSkip}
                                        disabled={loading}
                                    >
                                        Skip for now
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: ADDRESS */}
                        {step === 3 && (
                            <form onSubmit={form3.handleSubmit(onStep3Submit)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4">
                                    {/* Website */}
                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                id="website"
                                                placeholder="https://company.com"
                                                className="pl-10 h-10"
                                                {...form3.register("website")}
                                            />
                                        </div>
                                        {form3.formState.errors.website && (
                                            <p className="text-xs text-red-500">{form3.formState.errors.website.message}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="streetAddress">Street Address</Label>
                                            <Input id="streetAddress" {...form3.register("streetAddress")} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" {...form3.register("city")} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="state">State</Label>
                                            <Input id="state" {...form3.register("state")} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Input id="country" {...form3.register("country")} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="pin">PIN / Zip Code</Label>
                                            <Input id="pin" {...form3.register("pin")} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex-1"
                                        onClick={handleSkip}
                                        disabled={loading}
                                    >
                                        Skip
                                    </Button>
                                    <Button type="submit" className="flex-1 h-11" disabled={loading}>
                                        {loading ? "Finishing..." : "Finish Setup"}
                                        {!loading && <Check className="ml-2 h-4 w-4" />}
                                    </Button>
                                </div>
                            </form>
                        )}

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
