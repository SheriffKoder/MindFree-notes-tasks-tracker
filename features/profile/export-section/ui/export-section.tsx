/**
 * @file features/profile/export-section/ui/export-section.tsx
 * Profile export destination email + CSV download action.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfilePageQuery } from "@/entities/profile/client";
import { useExportData } from "@/features/profile/export-section/model/use-export-data";
import { QueryStatePanel } from "@/shared/react-query";

/**
 * Renders the Export section for the Profile page.
 */
export function ExportSection() {
  const query = useProfilePageQuery();

  if (query.isPending && !query.data) {
    return <QueryStatePanel message="Loading export…" variant="loading" />;
  }

  if (query.isError || !query.data) {
    return (
      <QueryStatePanel
        message={
          query.error instanceof Error
            ? query.error.message
            : "Couldn’t load export settings. Try refreshing the page."
        }
        variant="error"
      />
    );
  }

  return (
    <ExportSectionForm exportEmail={query.data.preferences.exportEmail} />
  );
}

function ExportSectionForm({ exportEmail: savedExportEmail }: { exportEmail: string }) {
  const {
    exportEmail,
    exportError,
    exportResult,
    isDirty,
    isExporting,
    isSaving,
    saveError,
    saveSuccess,
    setExportEmail,
    saveEmail,
    runExport,
  } = useExportData(savedExportEmail);

  return (
    <section
      aria-labelledby="profile-section-export"
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <h3
          className="text-lg font-semibold [color:var(--color-fg)]"
          id="profile-section-export"
        >
          Export
        </h3>
        <p className="text-sm [color:var(--color-fg-muted)]">
          Choose where exported data should be sent, then download an Excel
          workbook with Notes, Tasks, Reminders, and Records sheets.
        </p>
      </div>

      <form
        className="flex max-w-md flex-col gap-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          saveEmail();
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-export-email">Export email</Label>
          <Input
            autoComplete="email"
            id="profile-export-email"
            type="email"
            value={exportEmail}
            onChange={(event) => setExportEmail(event.target.value)}
          />
          <p className="text-caption [color:var(--color-fg-muted)]">
            Defaults to your signed-in email. Email delivery is not wired yet —
            exports download in the browser for now.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={!isDirty || isSaving} type="submit">
            {isSaving ? "Saving…" : "Save email"}
          </Button>
          {saveSuccess ? (
            <p
              className="text-caption [color:var(--color-success)]"
              role="status"
            >
              Saved
            </p>
          ) : null}
        </div>

        {saveError ? (
          <p className="text-caption [color:var(--color-error)]" role="alert">
            {saveError}
          </p>
        ) : null}
      </form>

      <div className="flex max-w-md flex-col gap-3">
        <Button
          disabled={isExporting}
          type="button"
          variant="outline"
          onClick={() => {
            void runExport();
          }}
        >
          {isExporting ? "Preparing export…" : "Export data"}
        </Button>

        {exportResult ? (
          <p className="text-caption [color:var(--color-fg-muted)]" role="status">
            {exportResult.message} (
            {exportResult.counts.notes} notes, {exportResult.counts.tasks}{" "}
            tasks, {exportResult.counts.reminders} reminders,{" "}
            {exportResult.counts.records} records)
          </p>
        ) : null}

        {exportError ? (
          <p className="text-caption [color:var(--color-error)]" role="alert">
            {exportError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
