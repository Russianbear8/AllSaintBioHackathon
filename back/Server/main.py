import os
import uuid
import zipfile
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from lib.analysis import analyse
from lib.carve import carveXML
from lib.modelseed import modelSeedXml
from pydantic import ValidationError
from schemas.schemas import UploadZipInput
from utils.utils import move_protein_file_to_uploads, remove_path

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:4173"])


UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.post("/upload-zip")
def upload():
    try:
        data = UploadZipInput(
            biomass_start=request.form.get("biomass_start"),
            biomass_end=request.form.get("biomass_end"),
            xmlCarvme=request.form.get("xmlCarvme"),
            genome_name=request.form.get("genome_name"),
            zip=request.files.get("zip"),
            hours=request.form.get("hours"),
            EX_glc__D_e=request.form.get("EX_glc__D_e"),
            EX_nh4_e=request.form.get("EX_nh4_e"),
            EX_pi_e=request.form.get("EX_pi_e"),
            EX_o2_e=request.form.get("EX_o2_e"),
            EX_so4_e=request.form.get("EX_so4_e"),
            EX_h2o_e=request.form.get("EX_h2o_e"),
            EX_h_e=request.form.get("EX_h_e"),
            EX_k_e=request.form.get("EX_k_e"),
            EX_na1_e=request.form.get("EX_na1_e"),
            EX_mg2_e=request.form.get("EX_mg2_e"),
            EX_ca2_e=request.form.get("EX_ca2_e"),
        )
    except ValidationError as e:
        return jsonify({"message": "Validation failed", "errors": e.errors()}), 400

    print(data)
    save_path = os.path.join(UPLOAD_FOLDER, f"{str(uuid.uuid4())}.zip")
    data.zip.save(save_path)

    extract_path = os.path.join(UPLOAD_FOLDER, str(uuid.uuid4()))
    with zipfile.ZipFile(save_path, "r") as zip_ref:
        zip_ref.extractall(extract_path)

    try:
        protein_file = move_protein_file_to_uploads(
            os.path.join(extract_path, "ncbi_dataset", "data")
        )
    except Exception:
        remove_path(save_path)
        remove_path(extract_path)
        return "", 400
    finally:
        remove_path(save_path)
        remove_path(extract_path)

    xml_file = None
    if data.xmlCarvme:
        xml_file = carveXML(protein_file)
    else:
        xml_file = modelSeedXml(protein_file, data.genome_name)

    remove_path(protein_file)
    remove_path(str(Path(protein_file).with_suffix(".tsv")))

    analysis_res = analyse(xml_file, data.getMediums(), data.hours, data.biomass_start)

    remove_path(xml_file)
    return jsonify(analysis_res), 200


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5123)
