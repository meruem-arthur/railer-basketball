"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label, Input, Textarea, Select, FieldError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { PlayerFormState } from "@/app/admin/(dashboard)/players/actions";
import type { Player, TeamSeason } from "@prisma/client";

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
  { value: "ALUMNI", label: "Alumni" },
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function PlayerForm({
  player,
  seasons,
  action,
  mode,
}: {
  player?: Player;
  seasons: TeamSeason[];
  action: (prev: PlayerFormState, formData: FormData) => Promise<PlayerFormState>;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, { success: false });
  const [photo, setPhoto] = useState<{ secureUrl: string; publicId: string } | null>(
    player?.photoUrl && player.photoPublicId
      ? { secureUrl: player.photoUrl, publicId: player.photoPublicId }
      : null
  );

  const handledSuccessRef = useRef(false);

  useEffect(() => {
    if (!state.success || handledSuccessRef.current) return;
    handledSuccessRef.current = true;

    if (mode === "create" && state.playerId) {
      toast.success("Player added.");
      router.push(`/admin/players/${state.playerId}`);
    } else if (mode === "edit") {
      toast.success("Player updated.");
    }
  }, [state, mode, router]);

  const errors = state.fieldErrors ?? {};
  const currentSeason = seasons.find((s) => s.isCurrent);

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      {state.error && (
        <p role="alert" className="text-sm text-rail-loss">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="photo">Photo</Label>
        <ImageUploader
          folder="players"
          initialUrl={photo?.secureUrl}
          onUploaded={setPhoto}
          label="Upload photo"
        />
        <input type="hidden" name="photoUrl" value={photo?.secureUrl ?? ""} />
        <input type="hidden" name="photoPublicId" value={photo?.publicId ?? ""} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="firstName" required>First name</Label>
          <Input id="firstName" name="firstName" defaultValue={player?.firstName} hasError={!!errors.firstName} />
          <FieldError message={errors.firstName} />
        </div>
        <div>
          <Label htmlFor="lastName" required>Last name</Label>
          <Input id="lastName" name="lastName" defaultValue={player?.lastName} hasError={!!errors.lastName} />
          <FieldError message={errors.lastName} />
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={player?.dateOfBirth?.toISOString().slice(0, 10)}
          />
        </div>
        <div>
          <Label htmlFor="heightCm">Height (cm)</Label>
          <Input id="heightCm" name="heightCm" type="number" min={120} max={250} defaultValue={player?.heightCm ?? ""} />
        </div>
        <div>
          <Label htmlFor="academicLevel">Academic level</Label>
          <Select id="academicLevel" name="academicLevel" defaultValue={player?.academicLevel ?? ""}>
            <option value="">Select level</option>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="programme">Programme</Label>
          <Input id="programme" name="programme" defaultValue={player?.programme ?? ""} />
        </div>
        <div>
          <Label htmlFor="hometown">Hometown</Label>
          <Input id="hometown" name="hometown" defaultValue={player?.hometown ?? ""} />
        </div>
        <div>
          <Label htmlFor="yearJoined">Year joined</Label>
          <Input id="yearJoined" name="yearJoined" type="number" min={2000} max={2100} defaultValue={player?.yearJoined ?? ""} />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Biography</Label>
        <Textarea id="bio" name="bio" rows={4} defaultValue={player?.bio ?? ""} />
      </div>

      <label className="flex items-center gap-2 text-sm text-rail-silver">
        <input type="checkbox" name="active" defaultChecked={player?.active ?? true} className="accent-rail-gold" />
        Active
      </label>

      {mode === "create" && (
        <div className="border-t border-rail-line pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-rail-silver mb-3">
            Assign to season (optional)
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="seasonId">Season</Label>
              <Select id="seasonId" name="seasonId" defaultValue={currentSeason?.id ?? ""}>
                <option value="">Don't assign yet</option>
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="jerseyNumber">Jersey #</Label>
              <Input id="jerseyNumber" name="jerseyNumber" type="number" min={0} max={99} />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Select id="position" name="position" defaultValue="">
                <option value="">Select</option>
                {POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      )}

      <SubmitButton label={mode === "create" ? "Add player" : "Save changes"} />
    </form>
  );
}
