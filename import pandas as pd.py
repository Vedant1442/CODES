import pandas as pd
import re

# Helper to extract obtained marks from '57/60'
def extract_marks(mark):
    if isinstance(mark, str) and '/' in mark:
        return int(mark.split('/')[0])
    return None

# Load each subject file
def load_subject(file_path, subject_code):
    df = pd.read_excel(file_path)
    df = df[['Student Code', 'Student Name', 'Total Marks']]
    df.rename(columns={'Total Marks': subject_code}, inplace=True)
    df[subject_code] = df[subject_code].apply(extract_marks)
    return df

# Load all subjects
lac = load_subject('LAC.xlsx', 'LAC')
qp = load_subject('QP.xlsx', 'QP')
mfr = load_subject('MFR.xlsx', 'MFR')
ieee = load_subject('IEEE.xlsx', 'IEEE')
cpps = load_subject('CPPS.xlsx', 'CPPS')

# Merge all on Student Code
merged = lac.merge(qp, on=['Student Code', 'Student Name'], how='outer')
merged = merged.merge(mfr, on=['Student Code', 'Student Name'], how='outer')
merged = merged.merge(ieee, on=['Student Code', 'Student Name'], how='outer')
merged = merged.merge(cpps, on=['Student Code', 'Student Name'], how='outer')

# Add Sr. No.
merged.insert(0, 'Sr. No.', range(1, len(merged) + 1))

# Calculate total marks
merged['Total Marks'] = merged[['LAC', 'QP', 'MFR', 'IEEE', 'CPPS']].sum(axis=1)

# Save to Excel
merged.to_excel('Compiled_Semester1_Results.xlsx', index=False)
print("✅ Compiled Excel generated: Compiled_Semester1_Results.xlsx")