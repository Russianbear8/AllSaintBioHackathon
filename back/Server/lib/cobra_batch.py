#!/usr/bin/env python3

import glob
import os

import cobra
import pandas as pd

# Store results
results = []

# Loop over all XML models
for file in glob.glob("*.xml"):
    print(f"Processing {file}...")

    try:
        # Load model
        model = cobra.io.read_sbml_model(file)

        # Ensure objective exists
        if model.objective is None:
            print(f"️ No objective found in {file}, skipping...")
            continue

        # Run FBA
        solution = model.optimize()

        # Store results
        results.append(
            {
                "model": os.path.basename(file),
                "reactions": len(model.reactions),
                "metabolites": len(model.metabolites),
                "genes": len(model.genes),
                "growth_rate": solution.objective_value,
            }
        )

    except Exception as e:
        print(f"Error processing {file}: {e}")

# Convert to DataFrame
df = pd.DataFrame(results)

# Save results
df.to_csv("cobrapy_results.csv", index=False)

print("\n Analysis complete! Results saved to cobrapy_results.csv")
print(df)
