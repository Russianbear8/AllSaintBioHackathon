import os
import shutil
import uuid


def move_protein_file_to_uploads(
    folder_name: str,
) -> str:
    data_path = folder_name

    if not os.path.isdir(data_path):
        raise FileNotFoundError(f"Missing data folder: {data_path}")

    entries = os.listdir(data_path)
    subfolders = [name for name in entries if os.path.isdir(os.path.join(data_path, name))]

    if not subfolders:
        raise FileNotFoundError(f"No folders found inside: {data_path}")

    first_folder_name = subfolders[0]
    protein_path = os.path.join(data_path, first_folder_name, "protein.faa")

    if not os.path.isfile(protein_path):
        raise FileNotFoundError(f"Missing file: {protein_path}")

    unique_name = f"{uuid.uuid4()}.faa"
    destination_path = os.path.join("./uploads", unique_name)

    shutil.move(protein_path, destination_path)

    return destination_path


def remove_path(path: str):
    try:
        if os.path.isdir(path):
            shutil.rmtree(path)
            print(f"Removed folder: {path}")
        elif os.path.isfile(path):
            os.remove(path)
            print(f"Removed file: {path}")
        else:
            print(f"Path does not exist: {path}")
    except Exception as e:
        print(f"Failed to remove {path}: {e}")
