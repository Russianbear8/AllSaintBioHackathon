import { UploadZip } from "@/features/uploadZip";
import cls from "./HomePage.module.scss";
import { Card, Typography } from "antd";
import { useTranslation } from "react-i18next";
export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={cls["main-container"]}>
      <Card>
        <Typography.Title className={cls["main-container__title"]}>
          {t("mainApp.pages.homePage.title")}
        </Typography.Title>
      </Card>
      <UploadZip />
    </div>
  );
};
