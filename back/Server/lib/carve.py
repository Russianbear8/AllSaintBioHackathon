import subprocess
from pathlib import Path


def carveXML(path: str):
    f = path
    out = str(Path(f).with_suffix(".faa.xml"))

    subprocess.run(
        ["carve", f, "-o", out],
        check=True,
    )

    return out
