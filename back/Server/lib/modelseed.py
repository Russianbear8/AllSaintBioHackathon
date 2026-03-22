from pathlib import Path

import cobra
from modelseedpy import MSBuilder, MSGenome


def modelSeedXml(faa_file: str, genome_name: str):

    out = str(Path(faa_file).with_suffix(".faa.xml"))

    genome = MSGenome.from_fasta(faa_file)
    genome.name = genome_name

    builder = MSBuilder(genome)
    model = builder.build_metabolic_model(model_id=f"{genome_name}_draft_model", genome=genome)

    cobra.io.write_sbml_model(model, out)

    return out
