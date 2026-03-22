import re
from contextlib import suppress

import cobra
import numpy as np


def _pretty_colname(col, model):
    if col == "t":
        return "time_h"

    is_byproduct = str(col).endswith("_BYPRODUCT")
    rxn_id = str(col).replace("_BYPRODUCT", "")

    # Prefer model reaction/metabolite metadata when available
    if rxn_id in model.reactions:
        rxn = model.reactions.get_by_id(rxn_id)
        met = list(rxn.metabolites.keys())[0] if len(rxn.metabolites) else None
        met_name = met.name if met is not None else rxn.name or rxn_id
        base = f"{met_name} "
    else:
        # Fallback: normalize unknown IDs into a readable label
        base = re.sub(r"[_\-]+", " ", rxn_id).strip()

    return f"{base} byproduct" if is_byproduct else f"{base} medium"


def matrix_to_series_dict(matrix: list[list]) -> dict[str, list]:
    if not matrix or len(matrix) < 2:
        return {}

    headers = matrix[0]
    rows = matrix[1:]

    result: dict[str, list] = {str(header): [] for header in headers}

    for row in rows:
        for i, header in enumerate(headers):
            value = row[i] if i < len(row) else None

            if isinstance(value, str):
                with suppress(ValueError):
                    value = float(value)

            result[str(header)].append(value)

    return result


def analyse(path: str, USER_MEDIUM: dict, hrs: int, X0_g_L: float):
    model = cobra.io.read_sbml_model(path)
    opt = model.optimize()
    medium = model.medium

    for key in medium:
        medium[key] = USER_MEDIUM.get(key, 0.1)

    model.medium = medium

    dt = 30  # sim time step in  in mins

    ts = int((hrs * 60) // dt)  # sim time steps

    X = np.zeros(int(ts))  # store biomass
    mediums = np.zeros((len(medium), int(ts)))  # store concs of mediums

    mediums[:, 0] = np.array(list(medium.values()))
    X[0] = X0_g_L  # intialise biomass at start value

    # Track ALL exchange reactions as possible byproducts
    exchange_ids = [rxn.id for rxn in model.exchanges]
    byproducts = np.zeros((len(exchange_ids), ts))  # accumulated secreted byproducts

    for t in range(ts - 1):  # loop timesteps-1 (0 is start biomass)
        opt = model.optimize()
        rate = opt.objective_value  # calc rate
        medium = dict(model.medium)

        # Update each medium component using model uptake flux:
        # consumption = uptake_flux (mmol/gDW/h) * biomass (gDW/L) * dt (h) -> mmol/L
        for k, v in medium.items():
            uptake_flux = max(0.0, -float(opt.fluxes.get(k, 0.0)))
            consumed = uptake_flux * X[t] * (dt / 60.0)
            medium[k] = max(0.0, float(v) - consumed)

        mediums[:, t + 1] = np.array(list(medium.values()), dtype=float)
        model.medium = medium

        # -------------------------
        for j, rxn_id in enumerate(exchange_ids):
            flux = float(opt.fluxes[rxn_id]) if rxn_id in opt.fluxes.index else 0.0

            secretion_flux = max(flux, 0.0)
            delta = secretion_flux * X[t] * (dt / 60.0)

            byproducts[j, t + 1] = byproducts[j, t] + delta

        X[t + 1] = X[t] + (rate * X[t] * (dt / 60))

    time = np.concatenate(
        [np.array(["t"], dtype=object), np.linspace(0, hrs, ts).astype(object)]
    ).reshape(-1, 1)

    mediumsOUT = np.vstack([np.array(list(medium.keys())), mediums.T])
    byOUT = np.vstack([np.char.add(np.array(exchange_ids), "_BYPRODUCT"), byproducts.T])

    mediumsOUT = np.hstack([time, mediumsOUT, byOUT])
    mediumsOUTnum = mediumsOUT[1:, :].astype(np.float64)
    mediumsOUTfilt = mediumsOUT[:, mediumsOUTnum.max(axis=0) > 0.1]

    biomassOUT = np.hstack([time, np.concat([np.array(["biomass"]), X]).reshape(-1, 1)])

    _arr = mediumsOUTfilt

    mapped_headers = [_pretty_colname(c, model) for c in _arr[0, :]]
    _arr[0, :] = np.array(mapped_headers, dtype=object)

    # Keep both names available for downstream cells
    mediumsOUTfilt2 = _arr

    return {
        "mediums": matrix_to_series_dict(mediumsOUTfilt2.tolist()),
        "biomass": matrix_to_series_dict(biomassOUT.tolist()),
    }
