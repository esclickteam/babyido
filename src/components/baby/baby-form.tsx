"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { babySchema, numberField, type BabyFormValues } from "@/lib/validations/baby";
import { useCreateBaby, useUpdateBaby } from "@/hooks/use-babies";
import { setSelectedBabyCookie } from "@/lib/baby-selection.client";
import type { Baby } from "@/types";
import { IdoButton } from "@/components/idoland/ido-button";
import { IdoPanel } from "@/components/idoland/ido-panel";
import { BabyPhotoUpload } from "@/components/baby/baby-photo-upload";
import { GenderPicker } from "@/components/baby/gender-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface BabyFormProps {
  baby?: Baby;
  onSuccess?: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--grass-deep)]">
      {children}
    </h3>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-semibold text-[var(--ink)]">{label}</Label>
      {children}
    </div>
  );
}

const inputClass =
  "rounded-2xl border-[var(--stroke)] bg-white/90 py-3 shadow-sm focus-visible:ring-[var(--grass)]";

export function BabyForm({ baby, onSuccess }: BabyFormProps) {
  const t = useTranslations("baby");
  const tc = useTranslations("common");
  const router = useRouter();
  const createBaby = useCreateBaby();
  const updateBaby = useUpdateBaby();
  const isEdit = Boolean(baby);

  const form = useForm<BabyFormValues>({
    resolver: zodResolver(babySchema),
    defaultValues: {
      name: baby?.name ?? "",
      photoUrl: baby?.photoUrl ?? "",
      birthDate: baby?.birthDate ? baby.birthDate.split("T")[0] : "",
      birthTime: baby?.birthTime ?? "",
      gender: baby?.gender ?? "male",
      gestationalWeek: baby?.gestationalWeek,
      birthWeight: baby?.birthWeight,
      birthHeight: baby?.birthHeight,
      birthHeadCircumference: baby?.birthHeadCircumference,
      birthType: baby?.birthType,
      hospital: baby?.hospital ?? "",
      feedingType: baby?.feedingType,
      allergies: baby?.allergies ?? [],
      notes: baby?.notes ?? "",
    },
  });

  async function onSubmit(data: BabyFormValues) {
    try {
      if (baby) {
        await updateBaby.mutateAsync({ id: baby._id, data });
        toast.success(tc("save"));
      } else {
        const created = await createBaby.mutateAsync(data);
        setSelectedBabyCookie(created._id);
        toast.success(t("babySaved"));
        router.push("/dashboard");
      }
      onSuccess?.();
    } catch {
      toast.error(tc("error"));
    }
  }

  const loading = createBaby.isPending || updateBaby.isPending;
  const photoUrl = form.watch("photoUrl");
  const name = form.watch("name");

  return (
    <IdoPanel className="!p-0 overflow-hidden">
      <div className="border-b border-[var(--stroke)] bg-gradient-to-l from-[var(--leaf)]/15 to-transparent px-6 py-5 md:px-8">
        <p className="ido-eyebrow">{isEdit ? t("editProfile") : t("newBaby")}</p>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--ink)] md:text-3xl">
          {isEdit ? t("profile") : t("addBabyTitle")}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-ink)]">{t("addBabySubtitle")}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-6 py-8 md:px-8">
        <section className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <BabyPhotoUpload
            value={photoUrl}
            name={name}
            onChange={(url) => form.setValue("photoUrl", url, { shouldDirty: true })}
          />
          <div className="w-full flex-1 space-y-5">
            <Field label={t("name")}>
              <Input
                id="name"
                placeholder={t("namePlaceholder")}
                className={inputClass}
                {...form.register("name")}
              />
            </Field>
            <GenderPicker
              value={form.watch("gender")}
              onChange={(g) => form.setValue("gender", g, { shouldDirty: true })}
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>{t("birthDetails")}</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("birthDate")}>
              <Input id="birthDate" type="date" className={inputClass} {...form.register("birthDate")} />
            </Field>
            <Field label={t("birthTime")}>
              <Input id="birthTime" type="time" className={inputClass} {...form.register("birthTime")} />
            </Field>
            <Field label={t("gestationalWeek")}>
              <Input
                id="gestationalWeek"
                type="number"
                min={20}
                max={45}
                placeholder="40"
                className={inputClass}
                {...form.register("gestationalWeek", numberField)}
              />
            </Field>
            <Field label={t("birthType")}>
              <Select
                value={form.watch("birthType") ?? ""}
                onValueChange={(v) => form.setValue("birthType", v as BabyFormValues["birthType"])}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder={t("selectOption")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vaginal">{t("vaginal")}</SelectItem>
                  <SelectItem value="cesarean">{t("cesarean")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("hospital")} className="sm:col-span-2">
              <Input
                id="hospital"
                placeholder={t("hospitalPlaceholder")}
                className={inputClass}
                {...form.register("hospital")}
              />
            </Field>
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>{t("measurements")}</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={`${t("birthWeight")} (${tc("grams")})`}>
              <Input
                id="birthWeight"
                type="number"
                placeholder="3200"
                className={inputClass}
                {...form.register("birthWeight", numberField)}
              />
            </Field>
            <Field label={`${t("birthHeight")} (${tc("cm")})`}>
              <Input
                id="birthHeight"
                type="number"
                placeholder="50"
                className={inputClass}
                {...form.register("birthHeight", numberField)}
              />
            </Field>
            <Field label={`${t("birthHead")} (${tc("cm")})`}>
              <Input
                id="birthHead"
                type="number"
                placeholder="35"
                className={inputClass}
                {...form.register("birthHeadCircumference", numberField)}
              />
            </Field>
          </div>
        </section>

        <section className="space-y-4">
          <SectionTitle>{t("notes")}</SectionTitle>
          <Textarea
            id="notes"
            rows={3}
            placeholder={t("notesPlaceholder")}
            className={cn(inputClass, "min-h-[100px] resize-none")}
            {...form.register("notes")}
          />
        </section>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <IdoButton type="submit" wide className="no-pulse sm:!w-auto sm:min-w-[200px]" disabled={loading}>
            {loading ? tc("loading") : isEdit ? tc("save") : t("saveBaby")}
          </IdoButton>
        </div>
      </form>
    </IdoPanel>
  );
}
