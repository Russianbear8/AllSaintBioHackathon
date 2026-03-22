import { Card, Select } from "antd";
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
import { useMemo, useState, useEffect } from "react";
import { toChartData } from "../utils";
import { useTranslation } from "react-i18next";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#ff8042",
  "#a4de6c",
  "#d0ed57",
  "#83a6ed",
  "#8dd1e1",
  "#d084d0",
  "#87d068",
  "#ff9f7f",
  "#b37feb",
];

const MAX_SELECTED = 15;
const MIN_SELECTED = 0;

export const MediumsChart: React.FC = () => {
  const [analysis] = useUnit([$analysis]);

  const data = useMemo(() => {
    if (!analysis) {
      return null;
    }
    return toChartData(analysis.mediums);
  }, [analysis]);

  const lineKeys = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    return Object.keys(data[0]).filter((key) => key !== "time_h");
  }, [data]);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    const initKeys = [];
    let i = 0;
    while (initKeys.length < 11 && i < lineKeys.length) {
      if (!lineKeys[i].includes("byproduct")) {
        initKeys.push(lineKeys[i]);
      }
      i++;
    }
    setSelectedKeys(initKeys);
  }, [lineKeys]);

  const { t } = useTranslation();
  if (!data) {
    return null;
  }

  return (
    <Card className={cls["chart-card"]}>
      <h3>{t("mainApp.entities.analysis.mediumsChart.title")}</h3>

      <Select
        allowClear
        mode="multiple"
        maxTagCount="responsive"
        placeholder="Select lines to display"
        value={selectedKeys}
        onChange={(next) => {
          if (next.length < MIN_SELECTED || next.length > MAX_SELECTED) {
            return;
          }

          setSelectedKeys(next);
        }}
        options={lineKeys.map((key) => ({
          value: key,
          label: key,
          disabled:
            selectedKeys.length >= MAX_SELECTED && !selectedKeys.includes(key),
        }))}
      />

      <ResponsiveContainer width="100%" height={700}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            height={40}
            dataKey="time_h"
            label={{
              value: t("mainApp.entities.analysis.mediumsChart.time"),
              position: "bottom",
              offset: -10,
            }}
          />

          <YAxis
            label={{
              value: t("mainApp.entities.analysis.mediumsChart.value"),
              angle: -90,
              position: "insideLeft",
            }}
          />

          <Tooltip
            labelFormatter={(value) =>
              `${t("mainApp.entities.analysis.mediumsChart.time")}: ${value}`
            }
            formatter={(value, name) => [value, String(name)]}
          />

          <Legend />

          {selectedKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              stroke={COLORS[index % COLORS.length]}
              dot={{ r: 2 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
