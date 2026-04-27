import { switchLocaleAction } from "@/features/locale/actions";
import { type Locale, SUPPORTED_LOCALES, getLocaleLabel } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher({
  currentLocale,
  currentPath
}: {
  currentLocale: Locale;
  currentPath: string;
}) {
  const nextLocale = SUPPORTED_LOCALES.find((l) => l !== currentLocale) ?? "en";

  return (
    <form action={switchLocaleAction}>
      <input name="locale" type="hidden" value={nextLocale} />
      <input name="currentPath" type="hidden" value={currentPath} />
      <Button size="sm" type="submit" variant="outline">
        {getLocaleLabel(nextLocale)}
      </Button>
    </form>
  );
}
