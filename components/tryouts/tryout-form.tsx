"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { Label, Input, Textarea, Select, FieldError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { submitTryoutApplication, type TryoutSubmitState } from "@/app/(public)/tryouts/actions";

const initialState: TryoutSubmitState = { success: false, message: "" };

const POSITIONS = [
  { value: "POINT_GUARD", label: "Point Guard" },
  { value: "SHOOTING_GUARD", label: "Shooting Guard" },
  { value: "SMALL_FORWARD", label: "Small Forward" },
  { value: "POWER_FORWARD", label: "Power Forward" },
  { value: "CENTER", label: "Center" },
];

const LEVELS = [
  { value: "LEVEL_100", label: "Level 100" },
  { value: "LEVEL_200", label: "Level 200" },
  { value: "LEVEL_300", label: "Level 300" },
  { value: "LEVEL_400", label: "Level 400" },
  { value: "LEVEL_500", label: "Level 500" },
  { value: "GRADUATE", label: "Graduate" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Submitting…" : "Submit application"}
    </Button>
  );
}

export function TryoutForm() {
  const [state, formAction] = useActionState(submitTryoutApplication, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col items-center text-center gap-3 border border-rail-gold/40 bg-rail-gold/[0.06] px-6 py-16">
        <CheckCircle2 className="h-10 w-10 text-rail-gold" />
        <p className="font-display text-3xl tracking-tight text-rail-white">Application received</p>
        <p className="max-w-sm text-rail-silver">
          Our coaching staff will review your application and reach out with next steps.
        </p>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-8">
      {state.message && !state.success && (
        <p role="alert" className="text-sm text-rail-loss">
          {state.message}
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="fullName" required>Full name</Label>
          <Input id="fullName" name="fullName" hasError={!!errors.fullName} />
          <FieldError message={errors.fullName} />
        </div>
        <div>
          <Label htmlFor="studentId" required>Student ID</Label>
          <Input id="studentId" name="studentId" hasError={!!errors.studentId} />
          <FieldError message={errors.studentId} />
        </div>
        <div>
          <Label htmlFor="programme" required>Programme</Label>
          <Input id="programme" name="programme" hasError={!!errors.programme} />
          <FieldError message={errors.programme} />
        </div>
        <div>
          <Label htmlFor="level" required>Level</Label>
          <Select id="level" name="level" hasError={!!errors.level} defaultValue="">
            <option value="" disabled>Select level</option>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </Select>
          <FieldError message={errors.level} />
        </div>
        <div>
          <Label htmlFor="phone" required>Phone</Label>
          <Input id="phone" name="phone" type="tel" hasError={!!errors.phone} />
          <FieldError message={errors.phone} />
        </div>
        <div>
          <Label htmlFor="email" required>Email</Label>
          <Input id="email" name="email" type="email" hasError={!!errors.email} />
          <FieldError message={errors.email} />
        </div>
        <div>
          <Label htmlFor="dateOfBirth" required>Date of birth</Label>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" hasError={!!errors.dateOfBirth} />
          <FieldError message={errors.dateOfBirth} />
        </div>
        <div>
          <Label htmlFor="position" required>Position</Label>
          <Select id="position" name="position" hasError={!!errors.position} defaultValue="">
            <option value="" disabled>Select position</option>
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
          <FieldError message={errors.position} />
        </div>
        <div>
          <Label htmlFor="heightCm">Height (cm)</Label>
          <Input id="heightCm" name="heightCm" type="number" min={120} max={250} />
        </div>
        <div>
          <Label htmlFor="yearsPlayed">Years played</Label>
          <Input id="yearsPlayed" name="yearsPlayed" type="number" min={0} max={30} />
        </div>
        <div>
          <Label htmlFor="preferredJerseyNumber">Preferred jersey number</Label>
          <Input id="preferredJerseyNumber" name="preferredJerseyNumber" type="number" min={0} max={99} />
        </div>
      </div>

      <div>
        <Label htmlFor="previousExperience">Previous basketball experience</Label>
        <Textarea id="previousExperience" name="previousExperience" rows={3} />
      </div>

      <div>
        <Label htmlFor="motivation" required>Why do you want to join the Railers?</Label>
        <Textarea id="motivation" name="motivation" rows={4} hasError={!!errors.motivation} />
        <FieldError message={errors.motivation} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="emergencyContactName" required>Emergency contact name</Label>
          <Input id="emergencyContactName" name="emergencyContactName" hasError={!!errors.emergencyContactName} />
          <FieldError message={errors.emergencyContactName} />
        </div>
        <div>
          <Label htmlFor="emergencyContactPhone" required>Emergency contact phone</Label>
          <Input id="emergencyContactPhone" name="emergencyContactPhone" hasError={!!errors.emergencyContactPhone} />
          <FieldError message={errors.emergencyContactPhone} />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
