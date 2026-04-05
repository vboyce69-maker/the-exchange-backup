
"use client";

import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function VerificationPage() {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <div className="max-w-xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-headline">Get Verified</h1>
            <p className="text-muted-foreground mt-2">Earn the "Verified Person" badge and increase your reliability score by up to 20%.</p>
          </div>

          <Card className="rounded-3xl shadow-lg border-none">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Step {step} of 3</span>
                <span className="text-xs font-bold text-primary">{Math.round((step / 3) * 100)}% Complete</span>
              </div>
              <Progress value={(step / 3) * 100} className="h-2" />
            </CardHeader>
            <CardContent className="pt-6">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold">Personal Information</h2>
                    <p className="text-sm text-muted-foreground">This info must match your government ID.</p>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fullname">Full Legal Name</Label>
                      <Input id="fullname" placeholder="Johnathan Doe" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="id-number">ID Number / Passport Number</Label>
                      <Input id="id-number" placeholder="XXXX-XXXX-XXXX" />
                    </div>
                  </div>
                  <Button className="w-full bg-primary font-bold h-12 rounded-xl" onClick={() => setStep(2)}>
                    Next Step
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold">Upload ID Document</h2>
                    <p className="text-sm text-muted-foreground">Upload a clear photo of your ID, Driver's License or Passport.</p>
                  </div>
                  <div 
                    className="border-2 border-dashed border-primary/20 rounded-2xl p-12 text-center cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={handleUpload}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
                        <p className="text-sm font-bold">Encrypting & Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-primary/40 mx-auto mb-4" />
                        <p className="font-bold">Click to upload or drag & drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG or PDF up to 10MB</p>
                      </>
                    )}
                  </div>
                  <Alert className="bg-blue-50 border-blue-100 text-blue-700">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-xs font-bold">Privacy Guaranteed</AlertTitle>
                    <AlertDescription className="text-[10px]">
                      Your ID is stored in an encrypted vault and is only used for one-time verification. 
                      It is never shared with other users.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 text-center animate-in zoom-in-95 fade-in">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Verification Submitted</h2>
                    <p className="text-sm text-muted-foreground">
                      Our moderation team is reviewing your documents. This usually takes less than 24 hours.
                    </p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <p className="text-xs font-bold text-primary flex items-center justify-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      Temporary "Review Pending" Badge Active
                    </p>
                  </div>
                  <Button className="w-full bg-primary font-bold h-12 rounded-xl" onClick={() => window.location.href = '/'}>
                    Back to Marketplace
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
