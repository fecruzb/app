import { useTranslation } from "react-i18next";
import { BarChart, LineChart, PieChart } from "@app/ui/chart";
import { UiDemoBlock } from "./ui-demo-block";
import { barChartSnippet, lineChartSnippet, pieChartSnippet } from "./ui-snippets";

const cartesianData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

const pieData = [
  { name: "Chrome", value: 275 },
  { name: "Safari", value: 200 },
  { name: "Firefox", value: 187 },
  { name: "Edge", value: 173 },
  { name: "Other", value: 90 },
];

/** Bar, line, and pie chart demos. */
export function ChartsSection() {
  const { t } = useTranslation();

  return (
    <>
      <UiDemoBlock
        title={t("landing.ui.sections.barChart.title")}
        description={t("landing.ui.sections.barChart.description")}
        importPath='import { BarChart } from "@app/ui/chart"'
        filename="bar-chart.tsx"
        code={barChartSnippet}
      >
        <BarChart
          data={cartesianData}
          index="month"
          series={["desktop", "mobile"]}
          seriesLabel={{
            desktop: t("landing.ui.demo.chartDesktop"),
            mobile: t("landing.ui.demo.chartMobile"),
          }}
        />
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.lineChart.title")}
        description={t("landing.ui.sections.lineChart.description")}
        importPath='import { LineChart } from "@app/ui/chart"'
        filename="line-chart.tsx"
        code={lineChartSnippet}
      >
        <LineChart
          data={cartesianData}
          index="month"
          series={["desktop", "mobile"]}
          seriesLabel={{
            desktop: t("landing.ui.demo.chartDesktop"),
            mobile: t("landing.ui.demo.chartMobile"),
          }}
        />
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.pieChart.title")}
        description={t("landing.ui.sections.pieChart.description")}
        importPath='import { PieChart } from "@app/ui/chart"'
        filename="pie-chart.tsx"
        code={pieChartSnippet}
        previewClassName="flex justify-center"
      >
        <PieChart data={pieData} innerRadius={60} />
      </UiDemoBlock>
    </>
  );
}
