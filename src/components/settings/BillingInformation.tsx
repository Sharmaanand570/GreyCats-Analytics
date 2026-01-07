import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2 } from "lucide-react";

export default function BillingInformation() {

    return (
        <div className="space-y-6">

            {/* Plan Details */}
            <Card className="shadow-none border bg-primary/5">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl text-primary">Pro Plan</CardTitle>
                            <CardDescription>
                                You are currently on the Pro plan.
                            </CardDescription>
                        </div>
                        <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Active</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>Unlimited Reports</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>Priority Support</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>Advance Analytics</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="shadow-none border-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>
                        Manage your payment details and billing address.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg max-w-xl">
                        <div className="flex items-center gap-4">
                            <div className="bg-zinc-100 p-2 rounded-md">
                                <CreditCard className="h-6 w-6 text-zinc-900" />
                            </div>
                            <div>
                                <p className="font-medium">Visa ending in 4242</p>
                                <p className="text-sm text-muted-foreground">Expires 12/2028</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                    </div>

                    <Button variant="ghost" className="pl-0 hover:bg-transparent hover:underline text-primary">
                        + Add Payment Method
                    </Button>
                </CardContent>
            </Card>

            {/* Billing Address */}
            <Card className="shadow-none border-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent className="px-0 max-w-xl">
                    <div className="bg-muted/30 p-4 rounded-lg border text-sm space-y-1">
                        <p className="font-medium">GreyCats Media Ltd</p>
                        <p>123 Business Park</p>
                        <p>Mumbai, Maharashtra, 400001</p>
                        <p>India</p>
                        <div className="pt-2">
                            <span className="text-muted-foreground">Billing Email:</span> accounting@greycats.io
                        </div>
                    </div>
                    <div className="pt-4">
                        <Button variant="outline" size="sm">Update Billing Details</Button>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
