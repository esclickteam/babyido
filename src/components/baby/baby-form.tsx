"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { babySchema, numberField, type BabyFormValues } from "@/lib/validations/baby";
import { useCreateBaby, useUpdateBaby } from "@/hooks/use-babies";
import type { Baby } from "@/types";
import { Button } from "@/components/ui/button";
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
import { GlassCard } from "@/components/shared/glass-card";

interface BabyFormProps {
  baby?: Baby;
  onSuccess?: () => void;
}

export function BabyForm({ baby, onSuccess }: BabyFormProps) {
  const t = useTranslations("baby");
  const tc = useTranslations("common");
  const createBaby = useCreateBaby();
  const updateBaby = useUpdateBaby();

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
        await createBaby.mutateAsync(data);
        toast.success(t("addChild"));
      }
      onSuccess?.();
    } catch {
      toast.error(tc("error"));
    }
  }

  const loading = createBaby.isPending || updateBaby.isPending;

  return (
    <GlassCard>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" className="rounded-xl" {...form.register("name")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">{t("birthDate")}</Label>
          <Input id="birthDate" type="date" className="rounded-xl" {...form.register("birthDate")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthTime">{t("birthTime")}</Label>
          <Input id="birthTime" type="time" className="rounded-xl" {...form.register("birthTime")} />
        </div>

        <div className="space-y-2">
          <Label>{t("gender")}</Label>
          <Select
            value={form.watch("gender")}
            onValueChange={(v) => form.setValue("gender", v as BabyFormValues["gender"])}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t("male")}</SelectItem>
              <SelectItem value="female">{t("female")}</SelectItem>
              <SelectItem value="other">{t("other")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gestationalWeek">{t("gestationalWeek")}</Label>
          <Input
            id="gestationalWeek"
            type="number"
            className="rounded-xl"
            {...form.register("gestationalWeek", numberField)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthWeight">{t("birthWeight")} ({tc("grams")})</Label>
          <Input id="birthWeight" type="number" className="rounded-xl" {...form.register("birthWeight", numberField)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthHeight">{t("birthHeight")} ({tc("cm")})</Label>
          <Input id="birthHeight" type="number" className="rounded-xl" {...form.register("birthHeight", numberField)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthHead">{t("birthHead")}</Label>
          <Input
            id="birthHead"
            type="number"
            className="rounded-xl"
            {...form.register("birthHeadCircumference", numberField)}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("birthType")}</Label>
          <Select
            value={form.watch("birthType") ?? ""}
            onValueChange={(v) => form.setValue("birthType", v as BabyFormValues["birthType"])}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vaginal">{t("vaginal")}</SelectItem>
              <SelectItem value="cesarean">{t("cesarean")}</SelectItem>
              <SelectItem value="other">{t("other")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hospital">{t("hospital")}</Label>
          <Input id="hospital" className="rounded-xl" {...form.register("hospital")} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Textarea id="notes" className="rounded-xl" rows={4} {...form.register("notes")} />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" className="rounded-xl" disabled={loading}>
            {loading ? "..." : tc("save")}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
