"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Label, Select } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { importPlayersCsvAction, type ImportState } from "@/app/admin/(dashboard)/players/import/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Importing…" : "Import players"}</Button>;
}

export function PlayerImportForm({ seasons }: { seasons: { id: string; label: string; isCurrent: boolean }[] }) {
  const [state, formAction] = useActionState(importPlayersCsvAction, { done: false } as ImportState);
  const current = seasons.find((s) => s.isCurrent);

  return (
    <div className="max-w-2xl space-y-6">
      <form action={formAction} className="space-y-5 border border-rail-line bg-rail-navy/40 p-6">
        {state.error && <p role="alert" className="text-sm text-rail-loss">{state.error}</p>}

        <div>
          <Label htmlFor="file" required>CSV file</Label>
          <input id="file" name="file" type="file" accept=".csv,text/csv" required className="block w-full text-sm text-rail-silver file:mr-4 file:border file:border-rail-line file:bg-rail-navy file:px-3 file:py-2 file:text-rail-white" />
        </div>

        <div>
          <Label htmlFor="seasonId">Add to season (optional)</Label>
          <Select id="seasonId" name="seasonId" defaultValue={current?.id ?? ""}>
            <option value="">Don&apos;t assign to a season</option>
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
          <p className="mt-2 text-xs text-rail-silver">
            A player is added to the season roster when their row has a position. Jersey numbers are optional.
          </p>
        </div>

        <SubmitButton />
      </form>

      {state.done && (
        <div className="border border-rail-line p-5 text-sm text-rail-white">
          <p className="font-medium">
            Done: {state.created} added, {state.updated} already existed
            {state.assigned ? `, ${state.assigned} placed on the roster` : ""}.
          </p>
          {state.notes && state.notes.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-rail-silver">
              {state.notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          )}
        </div>
      )}

      <div className="text-sm text-rail-silver space-y-2">
        <p className="text-rail-white font-medium">CSV format</p>
        <p>
          First row (header): <code>first_name, last_name, programme, level, position</code>. Optional columns: <code>jersey, height_cm, hometown, year_joined</code>.
          Height is never required. Any other column (like an index number) is ignored.
        </p>
        <p>Level can be 200, 300, 400, etc. Position can be Point Guard, PG, SG, SF, PF, Center. Photos can be added later from each player&apos;s edit page.</p>
        <p><a href="/player-import-template.csv" download className="text-rail-gold hover:underline">Download a template</a></p>
      </div>
    </div>
  );
}
