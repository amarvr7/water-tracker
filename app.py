import streamlit as st
import pandas as pd
import requests
from datetime import datetime

# --- CONFIG ---
st.set_page_config(page_title="H2O PRO", layout="centered")
# REPLACE THIS with your Apps Script Web App URL
SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw-KDXCkf5N1nsBy_UYpxtOIQfzna2I5MkCo9ezZNxBwJEB5tj3hfAaB6y0MIfZ8Pc/exec" 
# REPLACE THIS with your "Publish to Web" CSV Link
CSV_URL = "https://script.google.com/macros/s/AKfycbw-KDXCkf5N1nsBy_UYpxtOIQfzna2I5MkCo9ezZNxBwJEB5tj3hfAaB6y0MIfZ8Pc/exec"

st.markdown("""
    <style>
    .main { background-color: #0e1117; color: #ffffff; }
    .stButton>button { width: 100%; border-radius: 20px; background-color: #007bff; color: white; height: 3em; }
    </style>
    """, unsafe_allow_html=True)

# --- UI ---
st.title("💧 H2O PRO | Hydration")

team = ["Coach Alex", "Coach Jordan", "Coach Sam", "Coach Taylor"]
user = st.selectbox("Select User", team)
weight = st.number_input("Weight (kg)", value=80)
goal = round((weight / 20) * 33.814)

# Load Data
try:
    df = pd.read_csv(f"{CSV_URL}&cache={datetime.now().timestamp()}")
    today = datetime.now().strftime('%Y-%m-%d')
    current = df[(df['User'] == user) & (df['Date'] == today)]['Intake'].sum()
except:
    current = 0

st.metric("Current Intake", f"{int(current)} oz", f"{int(goal - current)} oz to go")
st.progress(min(current/goal, 1.0))

# --- LOGGING ---
def log_water(amt):
    payload = {
        "Date": datetime.now().strftime('%Y-%m-%d'),
        "User": user,
        "Intake": amt,
        "Goal": goal
    }
    # This sends the data directly to Google Sheets
    res = requests.post(SCRIPT_URL, json=payload)
    if res.status_code == 200:
        st.success("Logged!")
        st.rerun()
    else:
        st.error("Failed to sync.")

col1, col2, col3 = st.columns(3)
with col1:
    if st.button("+8oz"): log_water(8)
with col2:
    if st.button("+16oz"): log_water(16)
with col3:
    if st.button("+32oz"): log_water(32)

# Leaderboard
st.divider()
st.subheader("🏆 League")
if 'df' in locals() and not df.empty:
    today_df = df[df['Date'] == datetime.now().strftime('%Y-%m-%d')]
    if not today_df.empty:
        league = today_df.groupby('User').agg({'Intake': 'sum', 'Goal': 'max'})
        league['%'] = (league['Intake'] / league['Goal'] * 100).astype(int).astype(str) + "%"
        st.table(league[['%']])
