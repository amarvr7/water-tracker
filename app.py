import streamlit as st
import pandas as pd
from datetime import datetime
import requests

# --- CONFIG & THEME ---
st.set_page_config(page_title="H2O Pro Tracker", layout="centered")

st.markdown("""
    <style>
    .main { background-color: #0e1117; color: #ffffff; }
    .stButton>button { width: 100%; border-radius: 20px; background-color: #007bff; color: white; font-weight: bold; }
    .stButton>button:hover { background-color: #00d4ff; color: #0e1117; }
    </style>
    """, unsafe_allow_html=True)

# --- GOOGLE SHEETS SETTINGS ---
# Pulling the URL from your Secrets
SHEET_URL = st.secrets["connections"]["gsheets"]["spreadsheet"]
# Format the URL for direct CSV download (Reading)
CSV_URL = SHEET_URL.replace('/edit#gid=', '/export?format=csv&gid=')

# --- DATA FUNCTIONS ---
def load_data():
    try:
        # We add a cache-busting parameter to ensure we always get the latest data
        return pd.read_csv(f"{CSV_URL}&cachebuster={datetime.now().timestamp()}")
    except Exception as e:
        st.error("Could not connect to Google Sheet. Check permissions.")
        return pd.DataFrame(columns=["Date", "User", "Intake", "Goal"])

def save_data(user, amount, goal):
    # This uses a simple "Form Submission" trick to save data back to the sheet
    # For now, let's keep it simple: we will use the GSheets connection only for writing
    try:
        from streamlit_gsheets import GSheetsConnection
        conn = st.connection("gsheets", type=GSheetsConnection)
        current_df = load_data()
        new_row = pd.DataFrame([{
            "Date": datetime.now().strftime('%Y-%m-%d'),
            "User": user,
            "Intake": amount,
            "Goal": goal
        }])
        updated_df = pd.concat([current_df, new_row], ignore_index=True)
        conn.update(worksheet="logs", data=updated_df)
        return True
    except:
        return False

# --- APP UI ---
st.title("💧 H2O PRO | Team Hydration")

users = ["Coach Alex", "Coach Jordan", "Coach Sam", "Coach Taylor"]
selected_user = st.selectbox("Who is tracking?", users)

weight_kg = st.number_input("Weight (kg)", min_value=40, value=80)
daily_goal_oz = round((weight_kg / 20) * 33.814)

# Load existing data
df = load_data()
today = datetime.now().strftime('%Y-%m-%d')

# Calculate current progress
if not df.empty and 'User' in df.columns:
    user_today = df[(df['User'] == selected_user) & (df['Date'] == today)]
    current_total = user_today['Intake'].sum()
else:
    current_total = 0

# --- PROGRESS VISUAL ---
st.markdown(f"### Goal: {daily_goal_oz} oz | Current: {int(current_total)} oz")
progress = min(current_total / daily_goal_oz, 1.0)
st.progress(progress)

# --- ADD WATER BUTTONS ---
col1, col2, col3 = st.columns(3)

def handle_click(amt):
    with st.spinner("Saving..."):
        if save_data(selected_user, amt, daily_goal_oz):
            st.toast(f"Logged {amt}oz!")
            st.rerun()

with col1:
    if st.button("+8 oz"): handle_click(8)
with col2:
    if st.button("+16 oz"): handle_click(16)
with col3:
    if st.button("+32 oz"): handle_click(32)

# --- LEADERBOARD ---
st.divider()
st.subheader("🏆 Hydration League (Today)")
if not df.empty and 'Date' in df.columns:
    league_df = df[df['Date'] == today].groupby('User').agg({'Intake': 'sum', 'Goal': 'max'})
    if not league_df.empty:
        league_df['% Done'] = (league_df['Intake'] / league_df['Goal'] * 100).astype(int).astype(str) + "%"
        st.table(league_df[['% Done']].sort_values(by='% Done', ascending=False))
    else:
        st.info("No one has logged water today yet. Be the first!")
