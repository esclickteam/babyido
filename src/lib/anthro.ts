import { createAnthro } from "@flame-cai/anthro";
import dayAcfa from "@flame-cai/anthro/data/day_acfa.json";
import dayBmi from "@flame-cai/anthro/data/day_bmi.json";
import dayLhfa from "@flame-cai/anthro/data/day_lhfa.json";
import dayWfa from "@flame-cai/anthro/data/day_wfa.json";
import dayWfh from "@flame-cai/anthro/data/day_wfh.json";
import dayWfl from "@flame-cai/anthro/data/day_wfl.json";
import monthAcfa from "@flame-cai/anthro/data/month_acfa.json";
import monthBmi from "@flame-cai/anthro/data/month_bmi.json";
import monthLhfa from "@flame-cai/anthro/data/month_lhfa.json";
import monthWfa from "@flame-cai/anthro/data/month_wfa.json";
import monthWfh from "@flame-cai/anthro/data/month_wfh.json";
import monthWfl from "@flame-cai/anthro/data/month_wfl.json";

const dayTables = {
  wfa: dayWfa,
  lhfa: dayLhfa,
  bmi: dayBmi,
  acfa: dayAcfa,
  wfl: dayWfl,
  wfh: dayWfh,
};

const monthTables = {
  wfa: monthWfa,
  lhfa: monthLhfa,
  bmi: monthBmi,
  acfa: monthAcfa,
  wfl: monthWfl,
  wfh: monthWfh,
};

export const anthro = createAnthro(dayTables, monthTables);
