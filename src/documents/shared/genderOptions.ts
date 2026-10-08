import type { Option } from "../../form/field-spec";

export const GENDER_OPTIONS: readonly Option[] = [
  { value: "", label: "Not specified" },
  { value: "male", label: "Male (he / him / his)" },
  { value: "female", label: "Female (she / her / hers)" },
  { value: "nonbinary", label: "Non-binary (they / them / theirs)" },
];
