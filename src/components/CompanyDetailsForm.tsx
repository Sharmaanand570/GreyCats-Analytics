import { useEffect } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";
import { useUserStore } from "@/utils/useUserStore";
import { getProfileImageUrl } from "@/utils/imageUtils";
import { toast } from "sonner";

// shadcn/ui components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// -----------------------
// Zod Schema
// -----------------------
// Common country codes
const countryCodes = [
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "IN" },
  { code: "+61", country: "AU" },
  { code: "+81", country: "JP" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+86", country: "CN" },
  { code: "+971", country: "UAE" },
  { code: "+351", country: "PT" },
  { code: "+34", country: "ES" },
  { code: "+39", country: "IT" },
  { code: "+7", country: "RU" },
  { code: "+55", country: "BR" },
];

const countryPhoneRules: Record<string, { regex: RegExp; error: string }> = {
  "+1": { regex: /^\d{10}$/, error: "US/CA number must be 10 digits" },
  "+44": { regex: /^\d{10,11}$/, error: "UK number must be 10-11 digits" },
  "+91": { regex: /^\d{10}$/, error: "India number must be 10 digits" },
  "+61": { regex: /^\d{9}$/, error: "Australia number must be 9 digits" },
  "+81": { regex: /^\d{10}$/, error: "Japan number must be 10 digits" },
  "+49": { regex: /^\d{10,12}$/, error: "Germany number must be 10-12 digits" },
  "+33": { regex: /^\d{9}$/, error: "France number must be 9 digits" },
  "+86": { regex: /^\d{11}$/, error: "China number must be 11 digits" },
  "+971": { regex: /^\d{9}$/, error: "UAE number must be 9 digits" },
  "+351": { regex: /^\d{9}$/, error: "Portugal number must be 9 digits" },
  "+34": { regex: /^\d{9}$/, error: "Spain number must be 9 digits" },
  "+39": { regex: /^\d{10}$/, error: "Italy number must be 10 digits" },
  "+7": { regex: /^\d{10}$/, error: "Russia number must be 10 digits" },
  "+55": { regex: /^\d{10,11}$/, error: "Brazil number must be 10-11 digits" },
};

// -----------------------
// Zod Schema
// -----------------------
const companySchema = z.object({
  company: z.string().min(1, "Company is required"),
  streetAddress: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pin: z.string().optional(),
  phonePrefix: z.string().min(1, "Prefix required"),
  phoneNumber: z.string()
    .min(1, "Phone number is required")
    .regex(/^[\d\s\-\+\(\)]+$/, "Invalid characters in phone number"),
  website: z.string().url("Enter a valid URL"),
}).superRefine((data, ctx) => {
  const cleanNumber = data.phoneNumber.replace(/[^\d]/g, "");
  const rule = countryPhoneRules[data.phonePrefix];
  if (rule && !rule.regex.test(cleanNumber)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: rule.error,
      path: ["phoneNumber"],
    });
  }
});

// TS type for form
type CompanyFormValues = z.infer<typeof companySchema>;

export default function CompanyDetailsForm() {
  const queryClient = useQueryClient();
  const { fetchProfile } = useUserStore();

  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: userApi.getProfile,
  });

  const profile = profileResponse?.data;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company: "",
      streetAddress: "",
      city: "",
      state: "",
      country: "",
      pin: "",
      phonePrefix: "+91",
      phoneNumber: "",
      website: "",
    },
  });

  useEffect(() => {
    if (profile) {
      // Extract phone details: e.g. "+91 1234567890" -> prefix="+91", number="1234567890" Or simple regex
      // Assuming naive split for now if backend sends full string
      // NOTE: backend API doc says "companyPhone": "+91 1234567890"
      let prefix = "+91";
      let phoneNum = "";

      if (profile.companyPhone) {
        // Try to match with known codes, checking longer prefixes first
        const sortedCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);
        for (const c of sortedCodes) {
          if (profile.companyPhone.startsWith(c.code)) {
            prefix = c.code;
            phoneNum = profile.companyPhone.replace(c.code, "").trim();
            break;
          }
        }
        if (!phoneNum) phoneNum = profile.companyPhone; // fallback
      }


      reset({
        company: profile.companyName || "",
        streetAddress: profile.companyStreetAddress || "",
        city: profile.companyCity || "",
        state: profile.companyState || "",
        country: profile.companyCountry || "",
        pin: profile.companyPIN || "",
        phonePrefix: prefix,
        phoneNumber: phoneNum,
        website: profile.companyWebsite || "",
      });
    }
  }, [profile, reset]);

  const uploadLogoMutation = useMutation({
    mutationFn: userApi.uploadCompanyLogo,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Company logo updated");
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        fetchProfile();
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to upload logo");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large! Max 5MB");
        return;
      }
      uploadLogoMutation.mutate(file);
    }
  };

  const onSubmit: SubmitHandler<CompanyFormValues> = async (data) => {
    // Current backend implementation primarily updates basic profile info.
    // We'll update the companyName part of the profile.
    try {
      await userApi.updateProfile({
        companyName: data.company,
        companyStreetAddress: data.streetAddress,
        companyCity: data.city,
        companyState: data.state,
        companyCountry: data.country,
        companyPIN: data.pin,
        companyPhone: `${data.phonePrefix} ${data.phoneNumber.replace(/[^\d]/g, "")}`,
        companyWebsite: data.website,
      });
      toast.success("Company details saved");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    } catch (error) {
      toast.error("Failed to save changes");
    }
  };

  if (isLoading) {
    return <div className="p-4"><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <Card className="max-w-3xl border-none shadow-none mx-auto mb-20">
      <CardHeader>
        <CardTitle>Company Details</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4"
        >
          {/* Logo Upload Section */}
          <div className="flex items-center gap-6 mb-6 p-4 bg-muted/20 rounded-lg">
            <Avatar className="h-24 w-24 rounded-lg border-2 border-border">
              <AvatarImage src={getProfileImageUrl(profile?.companyLogo)} alt="Company Logo" className="object-cover" />
              <AvatarFallback className="rounded-lg text-2xl font-bold text-muted-foreground">
                {profile?.companyName?.[0]?.toUpperCase() || "C"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="font-medium">Company Logo</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="relative cursor-pointer overflow-hidden" type="button">
                  Upload Logo
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                    onChange={handleFileChange}
                    disabled={uploadLogoMutation.isPending}
                  />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {uploadLogoMutation.isPending ? "Uploading..." : "Recommended size: 500x500px. Max 5MB."}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company */}
            <div>
              <Label className="">Company</Label>
              <div className="mt-2">
                <Input  {...register("company")} />
                {errors.company && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.company.message}
                  </p>
                )}
              </div>
            </div>

            {/* Street */}
            <div className="md:col-span-2">
              <Label className="">Street Address</Label>
              <div className="mt-2">
                <Input {...register("streetAddress")} />
              </div>
            </div>

            {/* City */}
            <div>
              <Label className="">City</Label>
              <div className="mt-2">
                <Input {...register("city")} />
              </div>
              {errors.city && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>

            {/* State */}
            <div>
              <Label className="">State</Label>
              <div className="mt-2">
                <Input {...register("state")} />
              </div>
              {errors.state && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.state.message}
                </p>
              )}
            </div>

            {/* Country */}
            <div>
              <Label className="">Country</Label>
              <div className="mt-2">
                <Input {...register("country")} />
              </div>
              {errors.country && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.country.message}
                </p>
              )}
            </div>

            {/* PIN */}
            <div>
              <Label className="">PIN</Label>
              <div className="mt-2">
                <Input {...register("pin")} />
              </div>
            </div>

            {/* Phone with Prefix */}
            <div className="md:col-span-2">
              <Label className="">Phone Number</Label>
              <div className="mt-2 flex gap-2">
                <div className="w-[120px]">
                  <Controller
                    control={control}
                    name="phonePrefix"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Prefix" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.code} ({c.country})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <Input {...register("phoneNumber")} placeholder="1234567890" />
                </div>
              </div>
              {(errors.phonePrefix || errors.phoneNumber) && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.phonePrefix?.message || errors.phoneNumber?.message}
                </p>
              )}
            </div>

            {/* Website */}
            <div className="md:col-span-2">
              <Label className="">Website</Label>
              <div className="mt-2">
                <Input {...register("website")} />
                {errors.website && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.website.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
