import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const personalInfoSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    jobTitle: z.string().optional(),
    companyName: z.string().optional(),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

export default function PersonalInformation() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<PersonalInfoFormValues>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            fullName: "Alex Cohen",
            email: "alex@greycats.io",
            phone: "+1 (555) 123-4567",
            jobTitle: "Senior Analyst",
            companyName: "GreyCats Analytics",
        },
    });

    const onSubmit: SubmitHandler<PersonalInfoFormValues> = (data) => {
        console.log("Personal Info Submitted:", data);
        // Simulate API call
        return new Promise((resolve) => setTimeout(resolve, 1000));
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-none border-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        Update your personal details and public profile.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="flex items-center gap-6 mb-8">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src="/avatars/01.png" alt="@shadcn" />
                            <AvatarFallback className="text-xl">AC</AvatarFallback>
                        </Avatar>
                        <div>
                            <Button variant="outline" size="sm" className="mr-2">Upload New Picture</Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">Remove</Button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" {...register("fullName")} />
                            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" {...register("email")} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground">Email address cannot be changed for this account type.</p>
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" {...register("phone")} />
                            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="jobTitle">Job Title</Label>
                                <Input id="jobTitle" {...register("jobTitle")} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input id="companyName" {...register("companyName")} />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={isSubmitting}>Save Changes</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
