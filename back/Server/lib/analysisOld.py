import cobra
import pandas as pd
from cobra.medium import minimal_medium


def reactionAnalysis(start_mass: float, target_mass: float, xml_path: str):
    START_BIOMASS = start_mass
    TARGET_MASS = target_mass
    SAFETY = 1.25

    BIOMASS = TARGET_MASS - START_BIOMASS

    XML_FILEPATH = xml_path

    model = cobra.io.read_sbml_model(XML_FILEPATH)

    med = dict(model.medium)  # forces a plain, writable dict

    # Scale every uptake limit by 0.1
    for rxn_id in med:
        med[rxn_id] = float(med[rxn_id]) * 0.01

    med["EX_o2_e"] = 1000.0
    model.medium = med

    solution = model.optimize()
    # also return this GROWTH RATE
    MU_FBA = solution.objective_value

    minimal_medium2 = minimal_medium(model, MU_FBA, minimize_components=False)

    yield_rows = []
    for rxn_id, q_i in minimal_medium2.items():
        if q_i < 1e-9:
            continue
        rxn = model.reactions.get_by_id(rxn_id)
        met = list(rxn.metabolites.keys())[0]
        mw = met.formula_weight  # g/mol, from formula string
        Y_i = q_i / MU_FBA  # mmol/gDW

        yield_rows.append(
            {
                "reaction": rxn_id,
                "metabolite": met.name,
                "met_id": met.id,
                "formula": met.formula,
                "MW_g_mol": round(mw, 2),
                "uptake_mmol_gDW_h": round(q_i, 6),
                "yield_mmol_per_gDW": round(Y_i, 6),
            }
        )

    yields_df = (
        pd.DataFrame(yield_rows)
        .sort_values("yield_mmol_per_gDW", ascending=False)
        .reset_index(drop=True)
    )

    medium_rows = []
    for _, row in yields_df.iterrows():
        Y_i = row["yield_mmol_per_gDW"]
        mM_stoich = Y_i * BIOMASS  # mmol/L = mM, minimum stoichiometric
        mM_safe = mM_stoich * SAFETY
        gL_safe = (mM_safe / 1000.0) * row["MW_g_mol"]

        medium_rows.append(
            {
                "metabolite": row["metabolite"],
                "g_per_L": round(gL_safe, 4),
            }
        )

    medium_df = pd.DataFrame(medium_rows).reset_index(drop=True)

    medium_df.sort_values("g_per_L", ascending=False, inplace=True)

    medium_json_array = medium_df.to_dict(orient="records")

    return {"growth_rate": MU_FBA, "reaction_records": medium_json_array}
