import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GlobeIcon, MonitorIcon, SmartphoneIcon } from "lucide-react";
import { Button } from "@app/ui/button";
import { Checkbox } from "@app/ui/checkbox";
import { Combobox, type ComboboxOption } from "@app/ui/combobox";
import { Field, FieldGroup, FieldLabel } from "@app/ui/field";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { RadioGroup, RadioGroupItem } from "@app/ui/radio-group";
import { Switch } from "@app/ui/switch";
import { Textarea } from "@app/ui/textarea";
import { UiDemoBlock } from "./ui-demo-block";
import {
  checkboxSnippet,
  comboboxSnippet,
  fieldSnippet,
  formSnippet,
  inputSnippet,
  labelSnippet,
  radioGroupSnippet,
  switchSnippet,
  textareaSnippet,
} from "./ui-snippets";

/** Label, fields, combobox, check/radio/switch, and composed form demos. */
export function FormFieldsSection() {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState("web");
  const [formPlatform, setFormPlatform] = useState("web");
  const [formRole, setFormRole] = useState("member");
  const [formTerms, setFormTerms] = useState(false);
  const [formNotify, setFormNotify] = useState(true);

  const platformOptions: ComboboxOption[] = [
    {
      value: "web",
      label: t("landing.ui.demo.comboboxWeb"),
      icon: <GlobeIcon />,
      group: t("landing.ui.demo.comboboxGroup"),
    },
    {
      value: "mobile",
      label: t("landing.ui.demo.comboboxMobile"),
      icon: <SmartphoneIcon />,
      group: t("landing.ui.demo.comboboxGroup"),
    },
    {
      value: "desktop",
      label: t("landing.ui.demo.comboboxDesktop"),
      icon: <MonitorIcon />,
      group: t("landing.ui.demo.comboboxGroup"),
    },
  ];

  return (
    <>
      <UiDemoBlock
        title={t("landing.ui.sections.label.title")}
        description={t("landing.ui.sections.label.description")}
        importPath='import { Label } from "@app/ui/label"'
        filename="label.tsx"
        code={labelSnippet}
      >
        <div className="mx-auto grid max-w-md gap-2">
          <Label htmlFor="ui-demo-label">{t("landing.ui.demo.name")}</Label>
          <Input id="ui-demo-label" placeholder={t("landing.ui.demo.namePlaceholder")} />
        </div>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.input.title")}
        description={t("landing.ui.sections.input.description")}
        importPath='import { Input } from "@app/ui/input"'
        filename="input.tsx"
        code={inputSnippet}
      >
        <div className="mx-auto grid max-w-md gap-3">
          <Input placeholder={t("landing.ui.demo.namePlaceholder")} />
          <Input type="email" placeholder={t("landing.ui.demo.userEmail")} />
          <Input disabled placeholder={t("landing.ui.demo.inputDisabled")} />
        </div>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.textarea.title")}
        description={t("landing.ui.sections.textarea.description")}
        importPath='import { Textarea } from "@app/ui/textarea"'
        filename="textarea.tsx"
        code={textareaSnippet}
      >
        <div className="mx-auto grid max-w-md gap-3">
          <Textarea placeholder={t("landing.ui.demo.notesPlaceholder")} />
          <Textarea disabled placeholder={t("landing.ui.demo.textareaDisabled")} />
        </div>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.combobox.title")}
        description={t("landing.ui.sections.combobox.description")}
        importPath='import { Combobox } from "@app/ui/combobox"'
        filename="combobox.tsx"
        code={comboboxSnippet}
      >
        <div className="mx-auto max-w-md">
          <Combobox
            options={platformOptions}
            value={platform}
            onValueChange={setPlatform}
            placeholder={t("landing.ui.demo.comboboxPlaceholder")}
            searchPlaceholder={t("landing.ui.demo.comboboxSearch")}
            emptyMessage={t("landing.ui.demo.comboboxEmpty")}
            clearable
            clearLabel={t("landing.ui.demo.comboboxClear")}
            aria-label={t("landing.ui.demo.comboboxLabel")}
          />
        </div>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.field.title")}
        description={t("landing.ui.sections.field.description")}
        importPath='import { Field, FieldLabel, FieldGroup } from "@app/ui/field"'
        filename="field.tsx"
        code={fieldSnippet}
      >
        <div className="mx-auto grid max-w-lg gap-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ui-field-name">{t("landing.ui.demo.name")}</FieldLabel>
              <Input id="ui-field-name" placeholder={t("landing.ui.demo.namePlaceholder")} />
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="ui-field-terms" defaultChecked />
              <FieldLabel htmlFor="ui-field-terms">{t("landing.ui.demo.checkboxTerms")}</FieldLabel>
            </Field>
          </FieldGroup>

          {/* Same row as the Input control — checkbox / radio / switch share h-9 */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground">
              {t("landing.ui.demo.fieldInlineHint")}
            </p>
            <div className="flex items-center gap-3">
              <Input
                className="min-w-0 flex-1"
                placeholder={t("landing.ui.demo.namePlaceholder")}
                aria-label={t("landing.ui.demo.name")}
              />
              <Field orientation="horizontal">
                <Checkbox id="ui-field-inline-check" defaultChecked />
                <FieldLabel htmlFor="ui-field-inline-check">
                  {t("landing.ui.demo.checkboxTerms")}
                </FieldLabel>
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <Input
                className="min-w-0 flex-1"
                type="email"
                placeholder={t("landing.ui.demo.userEmail")}
                aria-label={t("landing.ui.demo.tableEmail")}
              />
              <RadioGroup defaultValue="member" orientation="horizontal">
                <Field orientation="horizontal">
                  <RadioGroupItem value="member" id="ui-field-inline-member" />
                  <FieldLabel htmlFor="ui-field-inline-member">
                    {t("landing.ui.demo.radioMember")}
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem value="admin" id="ui-field-inline-admin" />
                  <FieldLabel htmlFor="ui-field-inline-admin">
                    {t("landing.ui.demo.radioAdmin")}
                  </FieldLabel>
                </Field>
              </RadioGroup>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field>
                <FieldLabel htmlFor="ui-field-email">{t("landing.ui.demo.tableEmail")}</FieldLabel>
                <Input
                  id="ui-field-email"
                  type="email"
                  placeholder={t("landing.ui.demo.userEmail")}
                />
              </Field>
              <Field orientation="horizontal">
                <Switch id="ui-field-notify" defaultChecked />
                <FieldLabel htmlFor="ui-field-notify">
                  {t("landing.ui.demo.switchNotifications")}
                </FieldLabel>
              </Field>
            </div>
          </div>
        </div>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.checkbox.title")}
        description={t("landing.ui.sections.checkbox.description")}
        importPath='import { Checkbox } from "@app/ui/checkbox"'
        filename="checkbox.tsx"
        code={checkboxSnippet}
      >
        <FieldGroup className="mx-auto max-w-md">
          <Field orientation="horizontal">
            <Checkbox id="ui-demo-terms" defaultChecked />
            <FieldLabel htmlFor="ui-demo-terms">{t("landing.ui.demo.checkboxTerms")}</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="ui-demo-marketing" />
            <FieldLabel htmlFor="ui-demo-marketing">
              {t("landing.ui.demo.checkboxMarketing")}
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="ui-demo-disabled" disabled />
            <FieldLabel htmlFor="ui-demo-disabled">
              {t("landing.ui.demo.checkboxDisabled")}
            </FieldLabel>
          </Field>
        </FieldGroup>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.radioGroup.title")}
        description={t("landing.ui.sections.radioGroup.description")}
        importPath='import { RadioGroup, RadioGroupItem } from "@app/ui/radio-group"'
        filename="radio-group.tsx"
        code={radioGroupSnippet}
      >
        <div className="mx-auto grid max-w-md gap-6">
          <RadioGroup defaultValue="member" className="gap-3">
            <Field orientation="horizontal">
              <RadioGroupItem value="member" id="ui-demo-role-member" />
              <FieldLabel htmlFor="ui-demo-role-member">
                {t("landing.ui.demo.radioMember")}
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="admin" id="ui-demo-role-admin" />
              <FieldLabel htmlFor="ui-demo-role-admin">
                {t("landing.ui.demo.radioAdmin")}
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="owner" id="ui-demo-role-owner" disabled />
              <FieldLabel htmlFor="ui-demo-role-owner">
                {t("landing.ui.demo.radioOwner")}
              </FieldLabel>
            </Field>
          </RadioGroup>
          <RadioGroup defaultValue="web" orientation="horizontal">
            <Field orientation="horizontal">
              <RadioGroupItem value="web" id="ui-demo-plat-web" />
              <FieldLabel htmlFor="ui-demo-plat-web">{t("landing.ui.demo.comboboxWeb")}</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="mobile" id="ui-demo-plat-mobile" />
              <FieldLabel htmlFor="ui-demo-plat-mobile">
                {t("landing.ui.demo.comboboxMobile")}
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="desktop" id="ui-demo-plat-desktop" />
              <FieldLabel htmlFor="ui-demo-plat-desktop">
                {t("landing.ui.demo.comboboxDesktop")}
              </FieldLabel>
            </Field>
          </RadioGroup>
        </div>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.switch.title")}
        description={t("landing.ui.sections.switch.description")}
        importPath='import { Switch } from "@app/ui/switch"'
        filename="switch.tsx"
        code={switchSnippet}
      >
        <FieldGroup className="mx-auto max-w-md">
          <Field orientation="horizontal">
            <Switch id="ui-demo-notify" defaultChecked />
            <FieldLabel htmlFor="ui-demo-notify">
              {t("landing.ui.demo.switchNotifications")}
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Switch id="ui-demo-digest" size="sm" />
            <FieldLabel htmlFor="ui-demo-digest">{t("landing.ui.demo.switchDigest")}</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Switch id="ui-demo-switch-disabled" disabled />
            <FieldLabel htmlFor="ui-demo-switch-disabled">
              {t("landing.ui.demo.switchDisabled")}
            </FieldLabel>
          </Field>
        </FieldGroup>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.form.title")}
        description={t("landing.ui.sections.form.description")}
        importPath='import { Field, FieldLabel, FieldGroup } from "@app/ui/field"'
        filename="form.tsx"
        code={formSnippet}
      >
        <form
          className="mx-auto grid max-w-lg gap-4"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ui-form-name">{t("landing.ui.demo.name")}</FieldLabel>
              <Input id="ui-form-name" placeholder={t("landing.ui.demo.namePlaceholder")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field>
                <FieldLabel htmlFor="ui-form-platform">
                  {t("landing.ui.demo.comboboxLabel")}
                </FieldLabel>
                <Combobox
                  id="ui-form-platform"
                  options={platformOptions}
                  value={formPlatform}
                  onValueChange={setFormPlatform}
                  placeholder={t("landing.ui.demo.comboboxPlaceholder")}
                  searchPlaceholder={t("landing.ui.demo.comboboxSearch")}
                  emptyMessage={t("landing.ui.demo.comboboxEmpty")}
                />
              </Field>
              <Field orientation="horizontal">
                <Switch id="ui-form-notify" checked={formNotify} onCheckedChange={setFormNotify} />
                <FieldLabel htmlFor="ui-form-notify">
                  {t("landing.ui.demo.switchNotifications")}
                </FieldLabel>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="ui-form-notes">{t("landing.ui.demo.notes")}</FieldLabel>
              <Textarea id="ui-form-notes" placeholder={t("landing.ui.demo.notesPlaceholder")} />
            </Field>
            <Field>
              <FieldLabel>{t("landing.ui.demo.radioLabel")}</FieldLabel>
              <RadioGroup value={formRole} onValueChange={setFormRole} orientation="horizontal">
                <Field orientation="horizontal">
                  <RadioGroupItem value="member" id="ui-form-role-member" />
                  <FieldLabel htmlFor="ui-form-role-member">
                    {t("landing.ui.demo.radioMember")}
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem value="admin" id="ui-form-role-admin" />
                  <FieldLabel htmlFor="ui-form-role-admin">
                    {t("landing.ui.demo.radioAdmin")}
                  </FieldLabel>
                </Field>
              </RadioGroup>
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="ui-form-terms"
                checked={formTerms}
                onCheckedChange={(checked) => setFormTerms(checked === true)}
              />
              <FieldLabel htmlFor="ui-form-terms">{t("landing.ui.demo.checkboxTerms")}</FieldLabel>
            </Field>
          </FieldGroup>
          <Button type="submit">{t("landing.ui.demo.continue")}</Button>
        </form>
      </UiDemoBlock>
    </>
  );
}
