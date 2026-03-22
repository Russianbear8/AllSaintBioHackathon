import { BiomassChart, MediumsChart } from "@/entities/analysis";
import cls from "./GraphPage.module.scss";
import { Button, Flex } from "antd";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const GraphPage: React.FC = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  return (
    <div className={cls["main-container"]}>
      <Button onClick={() => navigate("/")}>
        {t("mainApp.pages.GraphPage.returnButton")}
      </Button>

      <Flex className={cls["charts-conatiner"]}>
        <BiomassChart />
        <MediumsChart />
      </Flex>
    </div>
  );
};
