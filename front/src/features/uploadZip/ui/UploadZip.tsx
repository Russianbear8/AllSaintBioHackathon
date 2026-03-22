import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Spin,
  Switch,
} from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import cls from "./UploadZip.module.scss";
import clsx from "clsx";
import {
  fetchAnalysis,
  fetchAnalysisFx,
  UploadFormInput,
  UploadFormOutput,
  UploadPropsSchema,
} from "../model";
import { useUnit } from "effector-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormItem } from "react-hook-form-antd";

export const UploadZip: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const zipInputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const schema = UploadPropsSchema(t);
  const { control, handleSubmit, setValue, reset, trigger, watch, getValues } =
    useForm<
      UploadFormInput,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any,
      UploadFormOutput
    >({
      resolver: zodResolver(schema),
      mode: "onChange",
      reValidateMode: "onChange",
      defaultValues: {
        xmlCarvme: false,
        genome_name: null,

        hours: null,
        EX_glc__D_e: null,
        EX_nh4_e: null,
        EX_pi_e: null,
        EX_o2_e: null,
        EX_so4_e: null,
        EX_h2o_e: null,
        EX_h_e: null,
        EX_k_e: null,
        EX_na1_e: null,
        EX_mg2_e: null,
        EX_ca2_e: null,
      },
    });

  const xmlCarveMe = watch("xmlCarvme");

  const [getAnalysis, getAnalysisLoading] = useUnit([
    fetchAnalysis,
    fetchAnalysisFx.pending,
  ]);

  useEffect(() => {
    const unsubscribe = fetchAnalysisFx.doneData.watch(() => {
      navigate("/graph");
      unsubscribe();
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const clearFile = useCallback(() => {
    reset({ ...getValues(), zip: null });
    if (zipInputRef.current) {
      zipInputRef.current.value = "";
    }
    setSelectedFile(null);
    trigger("zip");
  }, [trigger, reset, getValues]);

  const checkEndsWithZip = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".zip")) {
        message.error(t("mainApp.pages.features.uploadFile.selectError"));
        return;
      }

      setValue("zip", file);
      setSelectedFile(file);
      trigger("zip");
    },
    [t, setValue, trigger],
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (files.length === 1) {
      checkEndsWithZip(files[0]);
      return;
    }
  };

  const resetForm = useCallback(() => {
    reset({
      zip: null,
      biomass_start: null,
      EX_glc__D_e: null,
      EX_nh4_e: null,
      EX_pi_e: null,
      EX_o2_e: null,
      EX_so4_e: null,
      EX_h2o_e: null,
      EX_h_e: null,
      EX_k_e: null,
      EX_na1_e: null,
      EX_mg2_e: null,
      EX_ca2_e: null,
      hours: null,
      xmlCarvme: false,
      genome_name: null,
    });

    if (zipInputRef.current) {
      zipInputRef.current.value = "";
    }

    setDragging(false);
    setSelectedFile(null);
  }, [reset]);

  const onFinish = (values: UploadFormOutput) => {
    const result = UploadPropsSchema(t).safeParse(values);

    if (!result.success) {
      console.log(result.error.flatten());
      return;
    }

    getAnalysis(result.data);
    resetForm();
  };

  const loadTestZip = useCallback(async () => {
    try {
      const response = await fetch("/trial_data/ncbi_dataset.zip");
      if (!response.ok) {
        throw new Error("Failed to load test zip");
      }

      const blob = await response.blob();
      const file = new File([blob], "test_dataset.zip", {
        type: "application/zip",
        lastModified: Date.now(),
      });

      reset({
        zip: file,
        hours: 24,
        EX_glc__D_e: 10.0,
        EX_nh4_e: 5.0,
        EX_pi_e: 5.0,
        EX_o2_e: 20.0,
        EX_so4_e: 5.0,
        EX_h2o_e: 2.0,
        EX_h_e: 10.0,
        EX_k_e: 10.0,
        EX_na1_e: 10.0,
        EX_mg2_e: 10.0,
        EX_ca2_e: 2.0,
        biomass_start: 1,
        xmlCarvme: true,
        genome_name: null,
      });

      setSelectedFile(file);
      trigger();
    } catch {
      message.error(t("mainApp.pages.features.uploadFile.selectError"));
    }
  }, [reset, trigger, t]);

  return (
    <Spin spinning={getAnalysisLoading}>
      <Form<UploadFormInput>
        onFinish={() => handleSubmit(onFinish)()}
        layout="vertical"
        className={cls["main-container"]}
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={clsx(cls["drop-container"], {
            [cls["drop-container--dragging"]]: dragging,
          })}
        >
          {selectedFile ? (
            <span>
              {t("mainApp.pages.features.uploadFile.selectedFile", {
                file_name: selectedFile.name,
              })}
            </span>
          ) : (
            <span>{t("mainApp.pages.features.uploadFile.boxPrompt")}</span>
          )}
        </div>

        <FormItem control={control} name="zip">
          <>
            <div className={cls["file-select-buttons"]}>
              <div className={cls["file-select-buttons__control-container"]}>
                <Button
                  type="primary"
                  onClick={() => {
                    if (zipInputRef.current) {
                      zipInputRef.current.value = "";
                    }
                    zipInputRef.current?.click();
                  }}
                >
                  {t("mainApp.pages.features.uploadFile.selectButton")}
                </Button>
                <Button onClick={() => clearFile()}>
                  {t("mainApp.pages.features.uploadFile.clearButton")}
                </Button>
              </div>
              <Button
                onClick={() => {
                  loadTestZip();
                }}
              >
                {t("mainApp.pages.features.uploadFile.test")}
              </Button>
            </div>

            <input
              ref={zipInputRef}
              type="file"
              className={cls["input-control"]}
              accept=".zip,application/zip"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  checkEndsWithZip(file);
                }
              }}
            />
          </>
        </FormItem>

        <div className={cls["attributes-container"]}>
          <span>{t("mainApp.pages.features.uploadFile.xmlGeneration")}</span>
          <Divider className={cls["attributes-container__divider"]} />

          <div className={cls["double-switch"]}>
            <span>
              {t("mainApp.pages.features.uploadFile.xmlGeneration.modelseed")}
            </span>
            <FormItem control={control} name="xmlCarvme">
              <Switch />
            </FormItem>
            <span>
              {t("mainApp.pages.features.uploadFile.xmlGeneration.craveme")}
            </span>
          </div>

          {!xmlCarveMe && (
            <FormItem
              control={control}
              required
              className={cls["form-item"]}
              name="genome_name"
              label={t("mainApp.pages.features.uploadFile.form.genomeName")}
            >
              <Input
                className={cls["form-item"]}
                min={0}
                placeholder={t("mainApp.placeholders.general", {
                  field_name: t(
                    "mainApp.pages.features.uploadFile.form.genomeName",
                  ),
                })}
              />
            </FormItem>
          )}
        </div>
        <div className={cls["attributes-container"]}>
          <span>{t("mainApp.pages.features.uploadFile.attributes")}</span>
          <Divider className={cls["attributes-container__divider"]} />

          <Row gutter={20} justify={"space-between"}>
            <Col>
              <FormItem
                control={control}
                required
                className={cls["form-item"]}
                name="biomass_start"
                label={t("mainApp.pages.features.uploadFile.form.biomassStart")}
              >
                <InputNumber
                  className={cls["form-item"]}
                  min={0}
                  placeholder={t("mainApp.placeholders.general", {
                    field_name: t(
                      "mainApp.pages.features.uploadFile.form.biomassStart",
                    ),
                  })}
                />
              </FormItem>
            </Col>
            <Col>
              <FormItem
                control={control}
                required
                className={cls["form-item"]}
                name="hours"
                label={t("mainApp.pages.features.uploadFile.form.hours")}
              >
                <InputNumber
                  className={cls["form-item"]}
                  min={0}
                  precision={0}
                  placeholder={t("mainApp.placeholders.general", {
                    field_name: t(
                      "mainApp.pages.features.uploadFile.form.hours",
                    ),
                  })}
                />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={20} justify={"space-between"}>
            <Col span={12}>
              <FormItem
                control={control}
                className={cls["form-item"]}
                name="EX_glc__D_e"
                label={t("mainApp.pages.features.uploadFile.form.EX_glc__D_e")}
              >
                <InputNumber
                  className={cls["form-item"]}
                  min={0}
                  precision={2}
                  placeholder={t("mainApp.placeholders.general", {
                    field_name: t(
                      "mainApp.pages.features.uploadFile.form.EX_glc__D_e",
                    ),
                  })}
                />
              </FormItem>
            </Col>

            <Col span={12}>
              <FormItem
                control={control}
                className={cls["form-item"]}
                name="EX_nh4_e"
                label={t("mainApp.pages.features.uploadFile.form.EX_nh4_e")}
              >
                <InputNumber
                  className={cls["form-item"]}
                  min={0}
                  precision={2}
                  placeholder={t("mainApp.placeholders.general", {
                    field_name: t(
                      "mainApp.pages.features.uploadFile.form.EX_nh4_e",
                    ),
                  })}
                />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={20} justify={"space-between"}>
            <Col span={12}>
              <FormItem
                control={control}
                className={cls["form-item"]}
                name="EX_pi_e"
                label={t("mainApp.pages.features.uploadFile.form.EX_pi_e")}
              >
                <InputNumber
                  className={cls["form-item"]}
                  min={0}
                  precision={2}
                  placeholder={t("mainApp.placeholders.general", {
                    field_name: t(
                      "mainApp.pages.features.uploadFile.form.EX_pi_e",
                    ),
                  })}
                />
              </FormItem>
            </Col>

            <Col span={12}>
              <FormItem
                control={control}
                className={cls["form-item"]}
                name="EX_o2_e"
                label={t("mainApp.pages.features.uploadFile.form.EX_o2_e")}
              >
                <InputNumber
                  className={cls["form-item"]}
                  min={0}
                  precision={2}
                  placeholder={t("mainApp.placeholders.general", {
                    field_name: t(
                      "mainApp.pages.features.uploadFile.form.EX_o2_e",
                    ),
                  })}
                />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={20} justify={"space-between"}>
            <Col span={12}>
              <FormItem
                control={control}
                className={cls["form-item"]}
                name="EX_so4_e"
                label={t("mainApp.pages.features.uploadFile.form.EX_so4_e")}
              >
                <InputNumber
                  className={cls["form-item"]}
                  min={0}
                  precision={2}
                  placeholder={t("mainApp.placeholders.general", {
                    field_name: t(
                      "mainApp.pages.features.uploadFile.form.EX_so4_e",
                    ),
                  })}
                />
              </FormItem>
            </Col>

            <Col span={12}>
              <FormItem
                control={control}
                className={cls["form-item"]}
                name="EX_h2o_e"
                label={t("mainApp.pages.features.uploadFile.form.EX_h2o_e")}
              >
                <InputNumber
                  className={cls["form-item"]}
                  min={0}
                  precision={2}
                  placeholder={t("mainApp.placeholders.general", {
                    field_name: t(
                      "mainApp.pages.features.uploadFile.form.EX_h2o_e",
                    ),
                  })}
                />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={20} justify={"space-between"}>
            <Col span={12}>
              <FormItem
                control={control}
                className={cls["form-item"]}
                name="EX_h_e"
                label={t("mainApp.pages.features.uploadFile.form.EX_h_e")}
              >
                <InputNumber
                  className={cls["form-item"]}
                  min={0}
                  precision={2}
                  placeholder={t("mainApp.placeholders.general", {
                    field_name: t(
                      "mainApp.pages.features.uploadFile.form.EX_h_e",
                    ),
                  })}
                />
              </FormItem>
            </Col>

            <Col span={12}>
              <FormItem
                control={control}
                className={cls["form-item"]}
                name="EX_k_e"
                label={t("mainApp.pages.features.uploadFile.form.EX_k_e")}
              >
                <InputNumber
                  className={cls["form-item"]}
                  min={0}
                  precision={2}
                  placeholder={t("mainApp.placeholders.general", {
                    field_name: t(
                      "mainApp.pages.features.uploadFile.form.EX_k_e",
                    ),
                  })}
                />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={20} justify={"space-between"}>
            <Col span={12}>
              <FormItem
                control={control}
                className={cls["form-item"]}
                name="EX_na1_e"
                label={t("mainApp.pages.features.uploadFile.form.EX_na1_e")}
              >
                <InputNumber
                  className={cls["form-item"]}
                  min={0}
                  precision={2}
                  placeholder={t("mainApp.placeholders.general", {
                    field_name: t(
                      "mainApp.pages.features.uploadFile.form.EX_na1_e",
                    ),
                  })}
                />
              </FormItem>
            </Col>

            <Col span={12}>
              <FormItem
                control={control}
                className={cls["form-item"]}
                name="EX_mg2_e"
                label={t("mainApp.pages.features.uploadFile.form.EX_mg2_e")}
              >
                <InputNumber
                  className={cls["form-item"]}
                  min={0}
                  precision={2}
                  placeholder={t("mainApp.placeholders.general", {
                    field_name: t(
                      "mainApp.pages.features.uploadFile.form.EX_mg2_e",
                    ),
                  })}
                />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={20} justify={"space-between"}>
            <Col span={12}>
              <FormItem
                control={control}
                className={cls["form-item"]}
                name="EX_ca2_e"
                label={t("mainApp.pages.features.uploadFile.form.EX_ca2_e")}
              >
                <InputNumber
                  className={cls["form-item"]}
                  min={0}
                  precision={2}
                  placeholder={t("mainApp.placeholders.general", {
                    field_name: t(
                      "mainApp.pages.features.uploadFile.form.EX_ca2_e",
                    ),
                  })}
                />
              </FormItem>
            </Col>
          </Row>
        </div>

        <div className={cls["main-control-buttons"]}>
          <Button type="primary" htmlType="submit">
            {t("mainApp.pages.features.uploadFile.submit")}
          </Button>
          <Button type="default" onClick={() => resetForm()} htmlType="button">
            {t("mainApp.pages.features.uploadFile.reset")}
          </Button>
        </div>
      </Form>
    </Spin>
  );
};
