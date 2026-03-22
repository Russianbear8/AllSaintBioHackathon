from pydantic import BaseModel, ConfigDict, field_validator
from werkzeug.datastructures import FileStorage


class UploadZipInput(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    biomass_start: float
    xmlCarvme: bool
    genome_name: str | None = None
    zip: FileStorage
    hours: int

    EX_glc__D_e: float = 0.1
    EX_nh4_e: float = 0.1
    EX_pi_e: float = 0.1
    EX_o2_e: float = 0.1
    EX_so4_e: float = 0.1
    EX_h2o_e: float = 0.1
    EX_h_e: float = 0.1
    EX_k_e: float = 0.1
    EX_na1_e: float = 0.1
    EX_mg2_e: float = 0.1
    EX_ca2_e: float = 0.1

    @field_validator("zip")
    @classmethod
    def validate_zip(cls, value: FileStorage):
        if value is None:
            raise ValueError("zip is required")

        if not isinstance(value, FileStorage):
            raise ValueError("zip must be a file")

        if not value.filename:
            raise ValueError("zip filename is empty")

        if not value.filename.lower().endswith(".zip"):
            raise ValueError("Only .zip files are allowed")

        return value

    @field_validator(
        "EX_glc__D_e",
        "EX_nh4_e",
        "EX_pi_e",
        "EX_o2_e",
        "EX_so4_e",
        "EX_h2o_e",
        "EX_h_e",
        "EX_k_e",
        "EX_na1_e",
        "EX_mg2_e",
        "EX_ca2_e",
        mode="before",
    )
    @classmethod
    def default_exchange_value(cls, value):
        if value is None or value == "":
            return 0.1
        return value

    def getMediums(self) -> dict[str, float]:
        return {
            "EX_glc__D_e": self.EX_glc__D_e,
            "EX_nh4_e": self.EX_nh4_e,
            "EX_pi_e": self.EX_pi_e,
            "EX_o2_e": self.EX_o2_e,
            "EX_so4_e": self.EX_so4_e,
            "EX_h2o_e": self.EX_h2o_e,
            "EX_h_e": self.EX_h_e,
            "EX_k_e": self.EX_k_e,
            "EX_na1_e": self.EX_na1_e,
            "EX_mg2_e": self.EX_mg2_e,
            "EX_ca2_e": self.EX_ca2_e,
        }
