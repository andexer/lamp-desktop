import { createContext, useContext, createSignal, JSX } from "solid-js";
import { flatten, translator } from "@solid-primitives/i18n";
import { en } from "./en";
import { es } from "./es";
import { ru } from "./ru";
import { de } from "./de";
import { pt } from "./pt";

export type Locale = "en" | "es" | "ru" | "de" | "pt";

const dictionaries = {
  en: flatten(en),
  es: flatten(es),
  ru: flatten(ru),
  de: flatten(de),
  pt: flatten(pt),
};

const [locale, setLocale] = createSignal<Locale>("es");

const dict = () => dictionaries[locale()];
const t = translator(dict);

export { locale, setLocale, t };
