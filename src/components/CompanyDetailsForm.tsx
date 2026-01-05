import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// -----------------------
// Zod Schema
// -----------------------
const companySchema = z.object({
  company: z.string().min(1, "Company is required"),
  language: z.string().min(1, "Language is required"),
  streetAddress: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pin: z.string().optional(),
  phoneCountry: z.string().min(1, "Country code required"),
  phoneNumber: z.string().min(7, "Phone number seems short"),
  vatNumber: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  website: z.string().url("Enter a valid URL"),
  notes: z.string().optional(),
});

// TS type for form
type CompanyFormValues = z.infer<typeof companySchema>;

export default function CompanyDetailsForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company: "AntagonMedia.com",
      language: "English (US)",
      streetAddress: "Street Address",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      pin: "PIN",
      phoneCountry: "India",
      phoneNumber: "+91 82916 75130",
      vatNumber: "VAT Number",
      timezone: "America/Toronto",
      website: "http://www.antagonmedia.co",
      notes: "",
    },
  });

  const onSubmit: SubmitHandler<CompanyFormValues> = (data) => {
    alert("Saved — check console for submitted payload");
  };

  return (
    <Card className="max-w-3xl  shadow-none mx-auto mb-20">
      <CardHeader>
        <CardTitle>Company Details</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4"
        >
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

            {/* Language */}
            <div>
              <Label className="">Language</Label>
              <div className="mt-2">
                <Input {...register("language")} />
                {errors.language && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.language.message}
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

            {/* Phone */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="">Phone (Country)</Label>
                <div className="mt-2">
                  <Input {...register("phoneCountry")} />
                </div>
                {errors.phoneCountry && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.phoneCountry.message}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label className="">Phone Number</Label>
                <div className="mt-2">
                  <Input {...register("phoneNumber")} />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* VAT */}
            <div>
              <Label className="">VAT Number</Label>
              <div className="mt-2">
                <Input {...register("vatNumber")} />
              </div>
            </div>

            {/* Timezone (Select + RHF Controller) */}
            <div>
              <Label className="">Timezone</Label>

              <Controller
                control={control}
                name="timezone"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Toronto">
                        America/Toronto
                      </SelectItem>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                      <SelectItem value="Europe/London">
                        Europe/London
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.timezone && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.timezone.message}
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

            {/* Notes */}
            <div className="md:col-span-2">
              <Label className="">Notes</Label>
              <div className="mt-2">
                <Textarea {...register("notes")} rows={3} />
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
