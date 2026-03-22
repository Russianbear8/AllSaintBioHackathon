import { Card } from "antd";
import cls from "./BiomassChart.module.scss";
import { useUnit } from "effector-react";
import { $analysis } from "../model";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useMemo } from "react";
import { toChartData } from "../utils";
import { useTranslation } from "react-i18next";

export const BiomassChart: React.FC = () => {
  const [analysis] = useUnit([$analysis]);

  const data = useMemo(() => {
    if (!analysis) {
      return null;
    }
    return toChartData(analysis.biomass);
  }, [analysis]);

  const { t } = useTranslation();
  if (!data) {
    return null;
  }
  return (
    <Card className={cls["chart-card"]}>
      <h3>{t("mainApp.entities.analysis.biomassChart.title")}</h3>
      <ResponsiveContainer width="100%" height={700}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            height={40}
            dataKey="t"
            label={{
              value: t("mainApp.entities.analysis.biomassChart.time"),
              position: "bottom",
              offset: -10,
            }}
          />
          <YAxis
            label={{
              value: t("mainApp.entities.analysis.biomassChart.biomass"),
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            labelFormatter={(value) =>
              `${t("mainApp.entities.analysis.biomassChart.time")}: ${value}`
            }
            formatter={(value) => [
              value,
              t("mainApp.entities.analysis.biomassChart.biomass"),
            ]}
          />
          <Line
            type="monotone"
            dataKey="biomass"
            dot={{ r: 2 }}
            activeDot={{ r: 6 }}
          />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
